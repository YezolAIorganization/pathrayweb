import { useTranslation } from 'react-i18next';

const CHIPS = [
  {
    id: 'fit',
    title: 'Funding fit',
    text: 'High, medium or low, with reasons',
  },
  {
    id: 'source',
    title: 'Verified source',
    text: 'Every fact shows its check date',
  },
  {
    id: 'deadline',
    title: 'Deadline',
    text: 'Dated for each option',
  },
  {
    id: 'cash',
    title: 'Total cash needed',
    text: 'First-year cost in your currency',
  },
];

export function Chips() {
  const { t } = useTranslation();

  return (
    <ul className="mt-8 grid max-w-xl list-none grid-cols-1 gap-3 p-0 min-[420px]:grid-cols-2">
      {CHIPS.map((chip, i) => (
        <li
          key={chip.id}
          style={{ animationDelay: `${i * -2}s` }}
          className="rounded-control border border-white/12 bg-[rgb(19_31_63/0.92)] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] motion-safe:animate-float"
        >
          <p className="flex items-center gap-2 font-medium text-white">
            <span
              aria-hidden="true"
              className="inline-block size-1.5 rounded-full bg-cyan-bright"
            />
            {t(`landing.chips.${chip.id}.title`, chip.title)}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {t(`landing.chips.${chip.id}.text`, chip.text)}
          </p>
        </li>
      ))}
    </ul>
  );
}