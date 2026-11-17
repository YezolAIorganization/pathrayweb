import { useTranslation } from 'react-i18next';

const STEPS = [
  {
    id: 'check',
    title: 'Take the free Quick Check',
    text: 'Answer eight short questions. You see your funding tier and what the full report covers.',
  },
  {
    id: 'report',
    title: 'Get your Pathray Report',
    text: 'We research your options from official sources and send a funding-first report in up to 48 hours. Every fact shows its source and check date.',
  },
  {
    id: 'roadmap',
    title: 'Follow your roadmap',
    text: 'Turn the report into dated steps to submission. Expert help is optional, and you decide what you need.',
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      className="relative z-[1] mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
    >
      <h2 className="text-h2">
        {t('landing.how.title', 'How it works')}
      </h2>
      <p className="mt-3 max-w-xl text-white/70">
        {t(
          'landing.how.subline',
          'Three steps, one clear next move at each stage.',
        )}
      </p>

      <ol className="mt-8 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.id}
            className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]"
          >
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full border border-white/20 font-heading text-white"
            >
              {i + 1}
            </span>
            <h3 className="mt-4 text-xl">
              {t(`landing.how.${step.id}.title`, step.title)}
            </h3>
            <p className="mt-2 text-white/70">
              {t(`landing.how.${step.id}.text`, step.text)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}