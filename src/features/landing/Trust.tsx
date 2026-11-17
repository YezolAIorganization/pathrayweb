import { useTranslation } from 'react-i18next';

const ITEMS = [
  {
    id: 'data',
    title: 'Your data stays yours',
    text: 'Only you and your assigned expert see your answers. We never sell or share your data. Delete it any time.',
  },
  {
    id: 'sources',
    title: 'Every fact has a source',
    text: 'Each fact in your report shows its source link and the date we checked it. Rules and deadlines change, so we show you when we last looked.',
  },
  {
    id: 'honest',
    title: 'What we never do',
    text: 'We never guarantee admission, a scholarship or a visa. We take no commissions, run no sponsored placements, and sell no data.',
  },
];

export function Trust() {
  const { t } = useTranslation();

  return (
    <section
      id="trust"
      className="relative z-[1] mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
    >
      <h2 className="text-h2">
        {t('landing.trust.title', 'Why you can trust the report')}
      </h2>
      <p className="mt-3 max-w-xl text-white/70">
        {t(
          'landing.trust.text',
          'Nothing hidden: where the facts come from, who sees your data, and what we will not promise.',
        )}
      </p>

      <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        {ITEMS.map((item) => (
          <li
            key={item.id}
            className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]"
          >
            <h3 className="text-xl">
              {t(`landing.trust.${item.id}.title`, item.title)}
            </h3>
            <p className="mt-2 text-white/70">
              {t(`landing.trust.${item.id}.text`, item.text)}
            </p>
          </li>
        ))}
      </ul>
            <p className="mt-6 max-w-2xl text-sm text-white/70">
        {t(
          'landing.trust.credential',
          'Your report is prepared by a consultant who completed the British Council UK Agent and Counsellor Training and holds its certificate.',
        )}
      </p>
    </section>
  );
}