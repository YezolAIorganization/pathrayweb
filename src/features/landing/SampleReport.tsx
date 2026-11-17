import { useTranslation } from 'react-i18next';

function Icon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const CHECK = 'M5 12.5l4.5 4.5L19 7.5';
const QUESTION = 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01';
const CROSS = 'M6 6l12 12M18 6L6 18';
const TILDE = 'M4 13c2-4 4-4 8 0s6 4 8 0';

function VerifiedTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-sm font-medium text-white">
      <Icon d={CHECK} />
      {label}
    </span>
  );
}

function EstimateTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-100 px-3 py-1 text-sm font-medium text-navy-900">
      <Icon d={TILDE} />
      {label}
    </span>
  );
}

function UnverifiedTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-navy-700 bg-white px-3 py-1 text-sm font-medium text-navy-900">
      <Icon d={QUESTION} />
      {label}
    </span>
  );
}

const CHECKS = [
  { id: 'a', text: 'Degree level accepted', icon: CHECK, state: 'Met' },
  { id: 'b', text: 'Language test requirement', icon: CHECK, state: 'Met' },
  { id: 'c', text: 'Work experience requirement', icon: QUESTION, state: 'Needs confirmation' },
  { id: 'd', text: 'Minimum grade', icon: CROSS, state: 'Not met' },
];

export function SampleReport() {
  const { t } = useTranslation();

  return (
    <section
      id="sample-report"
      className="relative z-[1] mx-auto grid w-full max-w-[1200px] scroll-mt-24 gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-24"
    >
      <div>
        <h2 className="text-h2">
          {t('landing.sample.title', 'See what you get')}
        </h2>
        <p className="mt-3 max-w-md text-white/70">
          {t(
            'landing.sample.text',
            'Each option in your report shows its funding, what you meet and what you still need, the cash you need in your first year, and where every fact comes from.',
          )}
        </p>
        <a
          href="/check"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-white px-5 font-medium text-navy no-underline transition-transform duration-150 ease-pathray active:scale-[0.97]"
        >
          {t('landing.sample.cta', 'Start your free Quick Check')}
        </a>
      </div>

      <div className="rounded-card bg-white p-5 text-navy-900 shadow-[0_1px_2px_rgb(11_16_32/0.06),0_8px_24px_rgb(11_16_32/0.08)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-navy-300 bg-navy-50 px-3 py-1 text-sm font-medium text-navy">
            {t('landing.sample.badge', 'Sample')}
          </span>
          <VerifiedTag label={t('landing.sample.verified', 'Verified · checked 8 Nov')} />
        </div>

        <h3 className="mt-4 text-xl text-navy">
          {t('landing.sample.option', 'Sample country · MSc Computer Science')}
        </h3>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-navy">Funding</dt>
            <dd className="mt-1 text-navy-900/80">
              Grant with a monthly stipend. Shows what it covers and what it does not.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-navy">First-year cash needed</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 text-navy-900/80">
              In your currency, with the exchange rate and date.
              <EstimateTag label={t('landing.sample.estimate', 'Estimate')} />
            </dd>
          </div>
        </dl>

        <ul className="mt-5 grid list-none gap-2 border-t border-navy-100 p-0 pt-5 text-sm sm:grid-cols-2">
          {CHECKS.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <span className="mt-0.5 text-navy">
                <Icon d={c.icon} />
              </span>
              <span>
                {c.text}
                <span className="block text-navy-900/70">{c.state}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy-100 pt-5 text-sm">
          <span>
            <span className="font-medium text-navy">Fit:</span> Medium, with reasons listed
          </span>
          <UnverifiedTag label={t('landing.sample.unverified', 'Unverified: not yet confirmed')} />
        </div>

        <p className="mt-4 text-xs text-navy-900/70">
          {t(
            'landing.sample.note',
            'Sample content to show the layout. Your report uses real, checked facts for your case.',
          )}
        </p>
      </div>
    </section>
  );
}