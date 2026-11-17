import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatMoney } from '../../lib/money';
import { getAccountState, type AccountState } from '../account/account';
import { ProfileWizard } from '../profile/ProfileWizard';
import { ReportViewer } from './ReportViewer';

// Set to false to hide the proof upload until real payment details are ready.
const PAYMENT_PROOF_ENABLED = true;

type Journey = { id: string; status: string; funding_tier: string | null; market_id: string };
type Order = { id: string; reference: string; amount: number; currency: string; is_paid: boolean };
type Price = { price: number; currency: string };
type HomeData = { journey: Journey | null; order: Order | null; price: Price | null };

const STATUS_LABEL: Record<string, string> = {
  quick_check: 'Quick Check done',
  awaiting_payment: 'Waiting for your payment',
  payment_review: 'Payment under review',
  awaiting_profile: 'Complete your profile',
  in_research: 'Research in progress',
  in_review: 'Report being reviewed',
  delivered: 'Report delivered',
  closed: 'Closed',
};

const LOCALES: Record<string, string> = { PKR: 'en-PK', INR: 'en-IN', USD: 'en-US' };

const METHODS = [
  { id: 'bank_transfer', label: 'Bank transfer' },
  { id: 'jazzcash', label: 'JazzCash' },
  { id: 'easypaisa', label: 'Easypaisa' },
];

const MAX_BYTES = 5 * 1024 * 1024;
const FILE_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function money(amount: number, currency: string) {
  return formatMoney(Number(amount), currency, LOCALES[currency] ?? 'en-US');
}

async function loadHome(): Promise<HomeData> {
  const { data: journeys, error } = await supabase
    .from('journeys')
    .select('id,status,funding_tier,market_id')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;

  const journey = (journeys as Journey[] | null)?.[0] ?? null;
  if (!journey) return { journey: null, order: null, price: null };

  const { data: orders } = await supabase
    .from('orders')
    .select('id,reference,amount,currency,is_paid')
    .eq('journey_id', journey.id)
    .order('created_at', { ascending: false })
    .limit(1);
  const order = (orders as Order[] | null)?.[0] ?? null;

  let price: Price | null = null;
  const { data: services } = await supabase.from('services').select('id').eq('slug', 'report').limit(1);
  const serviceId = (services as { id: string }[] | null)?.[0]?.id;
  if (serviceId) {
    const { data: prices } = await supabase
      .from('service_market_prices')
      .select('price,currency')
      .eq('service_id', serviceId)
      .eq('market_id', journey.market_id)
      .limit(1);
    price = (prices as Price[] | null)?.[0] ?? null;
  }

  return { journey, order, price };
}

function friendlyProofError(message: string) {
  if (message.includes('already used')) {
    return 'This transaction ID was already used. Check the ID and try again.';
  }
  if (message.includes('already under review')) {
    return 'A payment for this order is already under review.';
  }
  return 'We could not send your proof. Please try again.';
}

function ProofForm({
  orderId,
  userId,
  onDone,
}: {
  orderId: string;
  userId: string;
  onDone: () => void;
}) {
  const [method, setMethod] = useState('');
  const [trx, setTrx] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);

    if (!method) return setError('Choose how you paid.');
    if (!file) return setError('Attach a photo or PDF of your payment receipt.');
    if (!FILE_EXT[file.type]) return setError('Use a PDF, JPG, PNG or WebP file.');
    if (file.size > MAX_BYTES) return setError('The file is too big. The limit is 5 MB.');

    setBusy(true);
    const path = `${userId}/${orderId}-${Date.now()}.${FILE_EXT[file.type]}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      setError('We could not upload your file. Please try again.');
      setBusy(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc('submit_payment_proof', {
      p_order_id: orderId,
      p_method: method,
      p_trx_id: trx,
      p_proof_path: path,
    });

    if (rpcError) {
      console.error('submit_payment_proof failed:', rpcError);
      setError(friendlyProofError(rpcError.message ?? ''));
      setBusy(false);
      return;
    }

    setBusy(false);
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 border-t border-white/12 pt-5">
      <h3 className="text-lg">I have paid</h3>

      <fieldset className="mt-3 border-0 p-0">
        <legend className="mb-2 font-medium">How did you pay?</legend>
        <div className="grid gap-3">
          {METHODS.map((m) => (
            <label key={m.id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="method"
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center rounded-control border border-white/15 bg-white/5 px-4 py-3 peer-checked:border-white peer-checked:bg-white/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-bright">
                {m.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <label htmlFor="trx" className="font-medium">
          Transaction ID <span className="font-normal text-white/70">(optional)</span>
        </label>
        <input
          id="trx"
          type="text"
          value={trx}
          onChange={(e) => setTrx(e.target.value)}
          className="mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-bright"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="proof" className="font-medium">
          Payment receipt <span className="font-normal text-white/70">(PDF or image, up to 5 MB)</span>
        </label>
        <input
          id="proof"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm text-white/80 file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-control file:border-0 file:bg-white file:px-4 file:font-medium file:text-navy"
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-white">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-white px-5 font-medium text-navy transition-transform duration-150 ease-pathray enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Sending...' : 'Send my payment proof'}
      </button>
    </form>
  );
}

export function HomePage() {
  const [account, setAccount] = useState<AccountState | null>(null);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const state = await getAccountState();
      setAccount(state);
      if (state.userId && !state.isAnonymous) {
        setData(await loadHome());
      }
    } catch (e) {
      console.error('Could not load home:', e);
      setError('We could not load your journey. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function placeOrder() {
    if (!data?.journey || ordering) return;
    setOrdering(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc('place_order', {
      p_journey_id: data.journey.id,
      p_service_slug: 'report',
    });
    if (rpcError) {
      console.error('place_order failed:', rpcError);
      setError('We could not create your order. Please try again.');
    } else {
      await refresh();
    }
    setOrdering(false);
  }

  const signedIn = Boolean(account && !account.isAnonymous && account.email);
  const journey = data?.journey ?? null;
  const order = data?.order ?? null;
  const price = data?.price ?? null;
  const tier = journey?.funding_tier?.replace('tier_', '').toUpperCase() ?? null;

  return (
    <div
      className="relative isolate min-h-svh bg-midnight text-white"
      style={{
        backgroundImage:
          'radial-gradient(60rem 40rem at 85% -10%, rgb(43 74 140 / 0.35), transparent 60%), radial-gradient(50rem 36rem at 0% 40%, rgb(27 47 94 / 0.45), transparent 60%)',
      }}
    >
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-21 w-full max-w-300 items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Pathray home" className="inline-flex">
            <img src="/brand/pathray-logo-dark.svg" alt="Pathray" width={128} height={45} />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-160 px-4 py-10 sm:py-16">
        {loading && <p role="status">Loading your journey...</p>}

        {!loading && !signedIn && (
          <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 sm:p-8">
            <h1 className="text-h2">Sign in to see your journey</h1>
            <p className="mt-3 text-white/70">
              Open the confirmation link from your email in this browser, or take the free Quick
              Check first.
            </p>
            <Link
              to="/check"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-white px-5 font-medium text-navy no-underline"
            >
              Take the Quick Check
            </Link>
          </div>
        )}

        {!loading && signedIn && !journey && (
          <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 sm:p-8">
            <h1 className="text-h2">No journey yet</h1>
            <p className="mt-3 text-white/70">Take the free Quick Check to start.</p>
            <Link
              to="/check"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-white px-5 font-medium text-navy no-underline"
            >
              Take the Quick Check
            </Link>
          </div>
        )}

        {!loading && signedIn && journey && (
          <div className="grid gap-4">
            <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 sm:p-8">
              <p className="text-sm text-white/70">Your journey</p>
              <div className="mt-3 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 font-heading text-2xl"
                >
                  {tier ?? '?'}
                </span>
                <div>
                  <h1 className="text-h2">Funding tier {tier ?? 'not set'}</h1>
                  <p className="text-white/70">
                    {STATUS_LABEL[journey.status] ?? journey.status}
                  </p>
                </div>
              </div>
            </div>

            {journey.status === 'awaiting_profile' && (
              <ProfileWizard journeyId={journey.id} onSubmitted={refresh} />
            )}

            {journey.status === 'delivered' && <ReportViewer journeyId={journey.id} />}

            {!order && journey.status === 'quick_check' && (
              <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 sm:p-8">
                <h2 className="text-xl">Pathray Report</h2>
                <p className="mt-2 text-white/70">
                  A funding-first report on your study options, researched from official sources,
                  with the source and check date for every fact. Delivered in up to 48 hours after
                  your payment is confirmed and your profile is complete.
                </p>
                {price && (
                  <p className="mt-4 font-heading text-2xl">{money(price.price, price.currency)}</p>
                )}
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={ordering || !price}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-white px-5 font-medium text-navy transition-transform duration-150 ease-pathray enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ordering ? 'Creating your order...' : 'Get your Pathray Report'}
                </button>
              </div>
            )}

            {order && (
              <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 sm:p-8">
                <h2 className="text-xl">Your order</h2>
                <dl className="mt-4 grid gap-3">
                  <div>
                    <dt className="text-sm text-white/70">Reference</dt>
                    <dd className="font-heading text-2xl">{order.reference}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-white/70">Amount</dt>
                    <dd className="text-lg">{money(order.amount, order.currency)}</dd>
                  </div>
                  <div>
                    <dt className="src/ text-sm text-white/70">Status</dt>
                    <dd className="text-lg">
                      {order.is_paid
                        ? 'Paid'
                        : journey.status === 'payment_review'
                          ? 'Payment under review'
                          : 'Waiting for your payment'}
                    </dd>
                  </div>
                </dl>

                {!order.is_paid && journey.status === 'awaiting_payment' && (
                  <>
                    <p className="mt-5 rounded-control border border-white/12 bg-white/5 p-4 text-white/80">
                      Payment details are coming soon. When they are ready, you will see where to
                      send your payment here. Keep your reference, you will need it.
                    </p>
                    {PAYMENT_PROOF_ENABLED && account?.userId && (
                      <ProofForm orderId={order.id} userId={account.userId} onDone={refresh} />
                    )}
                  </>
                )}

                {journey.status === 'payment_review' && (
                  <p className="mt-5 rounded-control border border-white/12 bg-white/5 p-4 text-white/80">
                    We received your payment proof. We will check it, and your status here updates
                    when it is confirmed.
                  </p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-white">
                {error}
              </p>
            )}
          </div>
        )}

        {!loading && error && !journey && (
          <p role="alert" className="mt-4 text-sm font-medium text-white">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}

export default HomePage;