import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatMoney } from '../../lib/money';
import { ReportBuilder } from './ReportBuilder';

type JourneyAdmin = {
  id: string;
  user_id?: string;
  status: string;
  funding_tier: string | null;
  market_id: string;
  created_at: string;
  sla_deadline?: string | null;
  profile_details?: Record<string, unknown> | null;
};

type OrderAdmin = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  is_paid: boolean;
};

type ProofAdmin = {
  id: string;
  method: string;
  trx_id: string | null;
  proof_path: string;
  created_at: string;
};

export function AdminPage() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [journeys, setJourneys] = useState<JourneyAdmin[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<JourneyAdmin | null>(null);
  const [order, setOrder] = useState<OrderAdmin | null>(null);
  const [proof, setProof] = useState<ProofAdmin | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');
    if (roleError || !isAdmin) {
      navigate('/home', { replace: true });
      return;
    }

    setAuthorized(true);

    const { data, error: fetchError } = await supabase
      .from('journeys')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Failed to load admin queue:', fetchError);
      setError('Could not load admin queue.');
    } else {
      setJourneys((data as JourneyAdmin[]) ?? []);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  async function selectJourney(j: JourneyAdmin) {
    setSelectedJourney(j);
    setOrder(null);
    setProof(null);
    setProofUrl(null);
    setStudentProfile(j.profile_details ?? null);

    const { data: submissions } = await supabase
      .from('profile_submissions')
      .select('*')
      .eq('journey_id', j.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (submissions && submissions.length > 0) {
      setStudentProfile(submissions[0] as Record<string, unknown>);
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('id, reference, amount, currency, is_paid')
      .eq('journey_id', j.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const currentOrder = (orders?.[0] as OrderAdmin | undefined) ?? null;
    setOrder(currentOrder);

    if (currentOrder) {
      const { data: proofs } = await supabase
        .from('payment_proofs')
        .select('id, method, trx_id, proof_path, created_at')
        .eq('order_id', currentOrder.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const currentProof = (proofs?.[0] as ProofAdmin | undefined) ?? null;
      setProof(currentProof);

      if (currentProof?.proof_path) {
        const { data: signed } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(currentProof.proof_path, 3600);
        if (signed?.signedUrl) {
          setProofUrl(signed.signedUrl);
        }
      }
    }
  }

  async function handleConfirmPayment(orderId: string) {
    if (busy) return;
    setBusy(true);
    const { error: rpcError } = await supabase.rpc('confirm_payment', { p_order_id: orderId });
    if (rpcError) {
      console.error('confirm_payment failed:', rpcError);
      alert('Failed to confirm payment.');
    } else {
      await loadQueue();
      if (selectedJourney) {
        await selectJourney({ ...selectedJourney, status: 'awaiting_profile' });
      }
    }
    setBusy(false);
  }

  async function handleRejectPayment(orderId: string) {
    if (busy) return;
    const reason = prompt('Reason for rejection:') ?? 'Incorrect payment proof';
    setBusy(true);
    const { error: rpcError } = await supabase.rpc('reject_payment', {
      p_order_id: orderId,
      p_reason: reason,
    });
    if (rpcError) {
      console.error('reject_payment failed:', rpcError);
      alert('Failed to reject payment.');
    } else {
      await loadQueue();
      if (selectedJourney) {
        await selectJourney({ ...selectedJourney, status: 'awaiting_payment' });
      }
    }
    setBusy(false);
  }

  async function handleAdvanceStatus(journeyId: string, nextStatus: string) {
    if (busy) return;
    setBusy(true);
    const { error: rpcError } = await supabase.rpc('advance_journey_status', {
      p_journey_id: journeyId,
      p_new_status: nextStatus,
    });
    if (rpcError) {
      console.error('advance_journey_status failed:', rpcError);
      alert('Failed to update status.');
    } else {
      await loadQueue();
      if (selectedJourney) {
        setSelectedJourney({ ...selectedJourney, status: nextStatus });
      }
    }
    setBusy(false);
  }

  if (!authorized && loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-midnight text-white">
        <p role="status">Checking admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-midnight text-white">
      <header className="border-b border-white/10 p-4">
        <div className="mx-auto flex max-w-300 items-center justify-between">
          <Link to="/" className="font-heading text-xl">
            Pathray Admin
          </Link>
          <button
            type="button"
            onClick={loadQueue}
            className="rounded-control bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-300 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5">
          <h2 className="text-xl font-medium">Journeys Queue ({journeys.length})</h2>
          {loading && <p className="mt-4 text-white/70">Loading queue...</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-4 grid gap-2">
            {journeys.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => selectJourney(j)}
                className={`w-full rounded-control border p-3 text-left transition-colors ${
                  selectedJourney?.id === j.id
                    ? 'border-cyan bg-white/15'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="font-medium">
                  Tier {j.funding_tier?.replace('tier_', '').toUpperCase() ?? '?'} ({j.market_id})
                </div>
                <div className="text-sm text-white/70">Status: {j.status}</div>
                <div className="mt-1 text-xs text-white/50">
                  {new Date(j.created_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 md:col-span-1 lg:col-span-2">
          {selectedJourney ? (
            <div>
              <h2 className="text-xl font-medium">Case Details</h2>
              <div className="mt-4 grid gap-2 text-sm text-white/80">
                <div>
                  <strong className="text-white">Journey ID:</strong> {selectedJourney.id}
                </div>
                <div>
                  <strong className="text-white">Market:</strong> {selectedJourney.market_id}
                </div>
                <div>
                  <strong className="text-white">Status:</strong> {selectedJourney.status}
                </div>
                {selectedJourney.sla_deadline && (
                  <div>
                    <strong className="text-white">48h SLA Deadline:</strong>{' '}
                    {new Date(selectedJourney.sla_deadline).toLocaleString()}
                  </div>
                )}
              </div>

              {order && (
                <div className="mt-6 border-t border-white/12 pt-4">
                  <h3 className="text-lg font-medium">Order: {order.reference}</h3>
                  <p className="mt-1 text-sm text-white/70">
                    Amount: {formatMoney(order.amount, order.currency, 'en-US')}
                  </p>
                  <p className="text-sm text-white/70">
                    Paid Status: {order.is_paid ? 'Confirmed Paid' : 'Unpaid'}
                  </p>

                  {proof && (
                    <div className="mt-4 rounded-control border border-white/15 bg-white/5 p-4 text-sm">
                      <div className="font-medium text-white">Submitted Payment Proof</div>
                      <div className="mt-2 grid gap-1 text-white/80">
                        <div>
                          <strong className="text-white">Method:</strong> {proof.method}
                        </div>
                        <div>
                          <strong className="text-white">Transaction ID:</strong>{' '}
                          {proof.trx_id || 'None provided'}
                        </div>
                        <div>
                          <strong className="text-white">Submitted:</strong>{' '}
                          {new Date(proof.created_at).toLocaleString()}
                        </div>
                      </div>
                      {proofUrl && (
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex min-h-10 items-center rounded-control bg-white px-4 text-sm font-medium text-navy no-underline"
                        >
                          View Payment Receipt
                        </a>
                      )}
                    </div>
                  )}

                  {!order.is_paid && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleConfirmPayment(order.id)}
                        className="rounded-control bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500 disabled:opacity-50"
                      >
                        Confirm Payment
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRejectPayment(order.id)}
                        className="rounded-control bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        Reject Payment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {studentProfile && (
                <div className="mt-6 border-t border-white/12 pt-4">
                  <h3 className="text-lg font-medium">Student Profile</h3>
                  <pre className="mt-2 overflow-x-auto rounded-control border border-white/10 bg-white/5 p-3 text-xs text-white/85">
                    {JSON.stringify(studentProfile, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-6 border-t border-white/12 pt-4">
                <h3 className="text-lg font-medium">Advance Journey Status</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['awaiting_profile', 'in_research', 'in_review', 'delivered', 'closed'].map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={busy || selectedJourney.status === status}
                        onClick={() => handleAdvanceStatus(selectedJourney.id, status)}
                        className="rounded-control border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 disabled:opacity-30"
                      >
                        Set to {status}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <ReportBuilder
                journeyId={selectedJourney.id}
                onPublished={async () => {
                  await loadQueue();
                  setSelectedJourney((prev) => (prev ? { ...prev, status: 'delivered' } : null));
                }}
              />
            </div>
          ) : (
            <p className="text-white/70">
              Select a journey from the queue to inspect cases, verify payment proofs, and build
              funding reports.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;