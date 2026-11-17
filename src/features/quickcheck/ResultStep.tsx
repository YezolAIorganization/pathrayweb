import { useEffect, useRef, useState } from 'react';
import { DESTINATIONS } from '../../config/markets';
import type { Tier } from './tier';
import { getAccountState, startAccount, type AccountState } from '../account/account';

const COPY: Record<Tier, { title: string; text: string }> = {
  A: {
    title: 'Funding is your main challenge',
    text: 'You need full funding on a limited budget. Fully funded places exist, but they are few and competitive, so your plan needs several options and early deadlines. Your report would focus on funded programmes and tell you honestly what is realistic.',
  },
  B: {
    title: 'You will need funding help',
    text: 'You can cover some costs but not all of them. Some options may work, usually by combining a scholarship with your own budget. Your report would show which combinations are realistic and how much cash you would still need.',
  },
  C: {
    title: 'You have room to choose',
    text: 'You can cover a good part of your costs. That opens more options, including partly funded and lower-cost programmes. Your report would compare the first-year cash needed for each option.',
  },
  D: {
    title: 'Your choice is mostly about fit',
    text: 'You can cover your own costs, so the decision is mostly about which programme suits your goals. Your report would check the exact cost, requirements and deadlines for the options that fit you best.',
  },
};

function SaveAccount({ email }: { email: string }) {
  const [account, setAccount] = useState<AccountState | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccountState()
      .then(setAccount)
      .catch(() => setAccount(null));
  }, []);

  async function save() {
    setSending(true);
    setError(null);
    try {
      await startAccount(email);
      setSent(true);
    } catch (e) {
      console.error('Could not start account:', e);
      setError('We could not send the link. Please check your email address and try again in a few minutes.');
    } finally {
      setSending(false);
    }
  }

  const hasAccount = Boolean(account && !account.isAnonymous && account.email);

  return (
    <div className="mt-6 rounded-control border border-white/12 bg-white/5 p-4">
      <h2 className="text-lg">Keep your result</h2>

      {hasAccount ? (
        <p className="mt-2 text-white/80">
          Your result is saved to your account ({account?.email}).
        </p>
      ) : sent ? (
        <p role="status" className="mt-2 text-white/80">
          We sent a confirmation link to {email}. Open it to finish. Check your spam folder if you
          do not see it.
        </p>
      ) : (
        <>
          <p className="mt-2 text-white/80">
            Add your email to keep this result and come back to it later. We send a link to {email}.
            No password needed.
          </p>
          <button
            type="button"
            onClick={save}
            disabled={sending || !email}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-white px-5 font-medium text-navy transition-transform duration-150 ease-pathray enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Save my result'}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-white">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

type Props = {
  tier: Tier | null;
  name: string;
  email: string;
  destinations: string[];
  onBack: () => void;
  onRestart: () => void;
};

export function ResultStep({ tier, name, email, destinations, onBack, onRestart }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const picked = destinations
    .filter((id) => id !== 'any')
    .map((id) => DESTINATIONS.find((d) => d.id === id)?.name)
    .filter((n): n is string => Boolean(n));

  const firstName = name.trim().split(' ')[0];

  if (!tier) {
    return (
      <>
        <h1 ref={headingRef} tabIndex={-1} className="text-h2 outline-none">
          We need a few more answers
        </h1>
        <p className="mt-3 text-white/70">
          Your funding tier needs your budget and scholarship answers. Go back and complete them.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-control bg-white px-5 font-medium text-navy"
          >
            Start over
          </button>
        </div>
      </>
    );
  }

  const copy = COPY[tier];

  return (
    <>
      <p className="text-sm text-white/70">
        {firstName ? `${firstName}, here is your Quick Check result` : 'Your Quick Check result'}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 font-heading text-3xl"
        >
          {tier}
        </span>
        <div>
          <p className="text-sm text-white/70">Funding tier {tier}</p>
          <h1 ref={headingRef} tabIndex={-1} className="text-h2 outline-none">
            {copy.title}
          </h1>
        </div>
      </div>

      <p className="mt-5 text-white/80">{copy.text}</p>

      <div className="mt-6 rounded-control border border-white/12 bg-white/5 p-4">
        <h2 className="text-lg">What we would research for you</h2>
        {picked.length > 0 ? (
          <ul className="mt-3 grid list-none gap-2 p-0">
            {picked.map((n) => (
              <li key={n} className="text-white/80">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-white/80">
            Countries that fit your budget and your profile, from official sources.
          </p>
        )}
      </div>

      <SaveAccount email={email} />

      <a
        href="/#services"
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white no-underline transition-transform duration-150 ease-pathray active:scale-[0.97]"
      >
        See what the Pathray Report includes
      </a>

      <p className="mt-4 text-sm text-white/70">
        This is a quick estimate from your answers, not a prediction and not a promise of
        admission or funding. The full report checks official sources and shows the date of every
        check.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white"
        >
          Start over
        </button>
      </div>
    </>
  );
}