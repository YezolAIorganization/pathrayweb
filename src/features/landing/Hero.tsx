import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chips } from './Chips';

const Globe = lazy(() => import('./Globe'));

const DRAFT_KEY = 'pathray:quickcheck-draft';

const LEVELS = [
  { id: 'bachelors', label: 'Bachelor’s' },
  { id: 'masters', label: 'Master’s' },
  { id: 'phd', label: 'PhD' },
  { id: 'unsure', label: 'Not sure yet' },
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function HeroGlobe() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    const id = window.setTimeout(() => setShow(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-8%] top-1/2 hidden w-[min(640px,52vw)] -translate-y-1/2 lg:block"
    >
      <Suspense fallback={null}>
        <Globe />
      </Suspense>
    </div>
  );
}

function QuickCheckCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [level, setLevel] = useState<string | null>(null);

  function start() {
    if (!level) return;
    try {
      let answers: Record<string, string | string[]> = {};
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.answers) answers = parsed.answers;
      }
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ answers: { ...answers, level }, index: 0 }),
      );
    } catch {
      // Storage can be blocked. The quiz still works without the preselected level.
    }
    navigate('/check');
  }

  return (
    <div
      id="quick-check"
      className="scroll-mt-24 rounded-card border border-white/12 bg-white/6 p-5 shadow-[0_10px_40px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.18)] backdrop-blur-[18px] backdrop-saturate-[1.4] motion-reduce:bg-[rgb(19_31_63/0.92)] motion-reduce:backdrop-blur-none sm:p-6"
    >
      <p className="text-sm text-white/70">
        {t('landing.hero.card.step', 'Free Quick Check')}
      </p>

      <fieldset className="mt-3 border-0 p-0">
        <legend className="font-heading text-xl text-white">
          {t('landing.hero.card.question', 'What level do you want to study?')}
        </legend>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LEVELS.map((item) => {
            const selected = level === item.id;
            return (
              <label key={item.id} className="relative block cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  value={item.id}
                  checked={selected}
                  onChange={() => setLevel(item.id)}
                  className="peer sr-only"
                />
                <span className="flex min-h-11 items-center justify-between gap-2 rounded-control border border-white/15 bg-white/5 px-4 py-3 text-white transition-colors duration-150 peer-checked:border-white peer-checked:bg-white/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-bright">
                  {item.label}
                  {selected && <CheckIcon />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        disabled={!level}
        onClick={start}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-white px-5 font-medium text-navy transition-transform duration-150 ease-pathray enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('landing.hero.card.continue', 'Continue')}
      </button>
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-24 lg:pt-20">
      <HeroGlobe />

      <div className="relative z-[1]">
        <h1 className="text-display">
          {t('landing.hero.title', 'Know what you can afford before you apply.')}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/80">
          {t(
            'landing.hero.subline',
            'Get a funding-first report on your study options, researched from official sources, in up to 48 hours. The Quick Check is free.',
          )}
        </p>
        <Chips />
      </div>

      <div className="relative z-[1]">
        <QuickCheckCard />
      </div>
    </section>
  );
}