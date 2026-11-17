import { useTranslation } from 'react-i18next';

export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section className="relative z-[1] mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-8 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] sm:p-12">
        <h2 className="text-h1">
          {t('landing.cta.title', 'Know what you can afford before you apply.')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          {t(
            'landing.cta.text',
            'Start with the free Quick Check. It takes a few minutes, and you do not need to pay.',
          )}
        </p>
        <a
          href="/check"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-control bg-white px-6 font-medium text-navy no-underline transition-transform duration-150 ease-pathray active:scale-[0.97]"
        >
          {t('landing.cta.button', 'Start your free Quick Check')}
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-[1] border-t border-white/10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <a href="/" aria-label="Pathray home" className="inline-flex">
          <img
            src="/brand/pathray-logo-dark.svg"
            alt="Pathray"
            width={128}
            height={45}
          />
        </a>

        <div className="max-w-xl text-sm text-white/70">
          <p>
            {t(
              'landing.footer.disclaimer',
              'Pathray gives research and guidance. We do not guarantee admission, a scholarship or a visa, and we are not a university or a government body.',
            )}
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} Pathray
          </p>
        </div>
      </div>
    </footer>
  );
}