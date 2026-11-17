import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccountState, signOut, type AccountState } from './account';

function readUrlError(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  return hash.get('error_description') ?? query.get('error_description');
}

export function AccountPage() {
  const [account, setAccount] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlError] = useState(readUrlError);

  useEffect(() => {
    getAccountState()
      .then(setAccount)
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await signOut();
    setAccount(await getAccountState());
  }

  const ready = Boolean(account && !account.isAnonymous && account.email);

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
        <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] sm:p-8">
          {loading && <p role="status">Checking your account...</p>}

          {!loading && urlError && (
            <>
              <h1 className="text-h2">This link did not work</h1>
              <p className="mt-3 text-white/70">
                The link may have expired or already been used. Go back to your result and ask for a
                new one.
              </p>
            </>
          )}

          {!loading && !urlError && ready && (
            <>
              <h1 className="text-h2">Your account is ready</h1>
              <p className="mt-3 text-white/70">
                You are signed in as {account?.email}. Your Quick Check result is saved to this
                account.
              </p>
            </>
          )}

          {!loading && !urlError && !ready && (
            <>
              <h1 className="text-h2">We could not confirm your account</h1>
              <p className="mt-3 text-white/70">
                Open the link from the email in the same browser where you took the Quick Check. If
                that does not work, take the Quick Check again and press Save my result.
              </p>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/check"
              className="inline-flex min-h-11 items-center justify-center rounded-control bg-white px-5 font-medium text-navy no-underline"
            >
              Back to the Quick Check
            </Link>
            {ready && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AccountPage;