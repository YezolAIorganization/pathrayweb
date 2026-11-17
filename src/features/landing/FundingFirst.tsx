import { useTranslation } from 'react-i18next';

const ORDER = [
  {
    id: 'funding',
    title: 'Funding feasibility',
    text: 'Can you realistically pay for it? We check grants, stipends, loans and your first-year cash.',
  },
  {
    id: 'eligibility',
    title: 'Hard eligibility',
    text: 'Do you meet the requirements, such as degree level, language test and deadlines?',
  },
  {
    id: 'fit',
    title: 'Academic fit',
    text: 'Does the programme suit your field and your goals?',
  },
];

export function FundingFirst() {
  const { t } = useTranslation();

  return (
    <section
      id="funding-first"
      className="relative z-[1] mx-auto grid w-full max-w-[1200px] scroll-mt-24 gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:pb-24"
    >
      <div>
        <h2 className="text-h2">
          {t('landing.funding.title', 'Money comes first, then everything else')}
        </h2>
        <p className="mt-3 max-w-md text-white/70">
          {t(
            'landing.funding.text',
            'We rank every option in the same order, so you do not fall for a place you cannot afford. The order never changes.',
          )}
        </p>
      </div>

      <ol className="relative m-0 list-none p-0">
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-[7px] top-4 w-px bg-cyan-bright/40"
        />
        {ORDER.map((item, i) => (
          <li key={item.id} className="relative pb-6 pl-10 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 size-[15px] rounded-full border border-cyan-bright bg-midnight"
            >
              <span className="absolute inset-[3px] rounded-full bg-cyan-bright" />
            </span>
            <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]">
              <p className="text-sm text-white/70">
                {t('landing.funding.step', 'Step')} {i + 1}
              </p>
              <h3 className="mt-1 text-xl">
                {t(`landing.funding.${item.id}.title`, item.title)}
              </h3>
              <p className="mt-2 text-white/70">
                {t(`landing.funding.${item.id}.text`, item.text)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}