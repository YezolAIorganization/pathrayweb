import { useTranslation } from 'react-i18next';
import {
  BUNDLES,
  SERVICES,
  URGENT_SURCHARGE,
  type Service,
} from '../../data/services';
import { formatMoney } from '../../lib/money';

function priceLabel(s: Service) {
  if (s.kind === 'free') return 'Free';
  if (s.kind === 'addon' && s.price === null) {
    return `+${Math.round(URGENT_SURCHARGE * 100)}%`;
  }
  if (s.price === null) return '';
  if (s.priceMax) {
    return `${formatMoney(s.price)} to ${formatMoney(s.priceMax)}`;
  }
  return formatMoney(s.price);
}

export function Services() {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className="relative z-[1] mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
    >
      <h2 className="text-h2">
        {t('landing.services.title', 'Services and prices')}
      </h2>
      <p className="mt-3 max-w-xl text-white/70">
        {t(
          'landing.services.text',
          'Start free. Pay only for what you need. You see the total before you pay.',
        )}
      </p>

      <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {BUNDLES.map((b) => (
          <li
            key={b.id}
            className="flex flex-col rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]"
          >
            <h3 className="text-xl">{b.name}</h3>
            <p className="mt-2 font-heading text-2xl">{formatMoney(b.price)}</p>
            <ul className="mt-4 grid list-none gap-2 p-0 text-sm text-white/70">
              {b.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] sm:p-6">
        <h3 className="text-xl">
          {t('landing.services.all', 'All services')}
        </h3>
        <ul className="mt-4 grid list-none gap-0 p-0">
          {SERVICES.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-4 border-t border-white/10 py-3 first:border-t-0"
            >
              <div>
                <p className="font-medium text-white">{s.name}</p>
                {s.note && (
                  <p className="mt-0.5 text-sm text-white/70">{s.note}</p>
                )}
              </div>
              <p className="shrink-0 text-right text-white">{priceLabel(s)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}