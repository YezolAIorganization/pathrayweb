import { useTranslation } from 'react-i18next';

const FAQS = [
  {
    id: 'quick',
    q: 'What is the Quick Check?',
    a: 'A free set of eight short questions. You see your funding tier and what the full report would cover. You do not need to pay to take it.',
  },
  {
    id: 'time',
    q: 'How long does the report take?',
    a: 'Up to 48 hours. The clock starts once your payment is confirmed and your profile is complete. The urgent add-on shortens this to 24 hours.',
  },
  {
    id: 'guarantee',
    q: 'Do you guarantee admission, a scholarship or a visa?',
    a: 'No. Nobody can. We research your options from official sources and show you what is realistic, with every fact dated and linked to its source.',
  },
  {
    id: 'pay',
    q: 'How do I pay?',
    a: 'By bank transfer, JazzCash or Easypaisa. You upload your payment proof, we confirm it, and the work starts. You see the total before you pay.',
  },
  {
    id: 'apply',
    q: 'Do you submit my application for me?',
    a: 'With the Application Roadmap you submit it yourself, and we guide every step. With Guided Application an expert works with you on one university.',
  },
  {
    id: 'data',
    q: 'Who sees my data?',
    a: 'Only you and your assigned expert. We never sell or share it, and you can delete it at any time.',
  },
];

function Chevron() {
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
      className="shrink-0 transition-transform duration-200 group-open:rotate-180"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Faq() {
  const { t } = useTranslation();

  return (
    <section
      id="faq"
      className="relative z-[1] mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
    >
      <h2 className="text-h2">
        {t('landing.faq.title', 'Questions people ask')}
      </h2>

      <div className="mt-8 max-w-3xl">
        {FAQS.map((item) => (
          <details
            key={item.id}
            className="group border-t border-white/12 last:border-b"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-medium text-white [&::-webkit-details-marker]:hidden">
              {t(`landing.faq.${item.id}.q`, item.q)}
              <Chevron />
            </summary>
            <p className="pb-5 pr-8 text-white/70">
              {t(`landing.faq.${item.id}.a`, item.a)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}