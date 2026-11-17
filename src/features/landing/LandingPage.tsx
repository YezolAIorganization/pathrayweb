import { useTranslation } from 'react-i18next';
import { HowItWorks } from './HowItWorks';
import { SampleReport } from './SampleReport';
import { FundingFirst } from './FundingFirst';
import { Services } from './Services';
import { Trust } from './Trust';
import { Faq } from './Faq';
import { FinalCta, Footer } from './Closing';

function Backdrop() {
  const grain =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 85% -10%, rgb(43 74 140 / 0.35), transparent 60%), radial-gradient(50rem 36rem at 0% 40%, rgb(27 47 94 / 0.45), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: grain, opacity: 0.035 }}
      />
    </div>
  );
}

function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-midnight/90">
      <div className="mx-auto flex h-[84px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" aria-label="Pathray home" className="inline-flex">
          <img
            src="/brand/pathray-logo-dark.svg"
            alt="Pathray"
            width={128}
            height={45}
          />
        </a>

        <a
          href="/check"
          className="inline-flex min-h-11 items-center justify-center rounded-control bg-white px-5 font-medium text-navy no-underline transition-transform duration-150 ease-pathray active:scale-[0.97]"
        >
          {t('landing.header.start', 'Start Quick Check')}
        </a>
      </div>
    </header>
  );
}

export function LandingPage() {
  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-midnight text-white">
      <a
        href="#main"
        className="absolute left-4 top-4 z-50 -translate-y-24 rounded-control bg-white px-4 py-2 text-navy focus:translate-y-0"
      >
        Skip to content
      </a>

      <Backdrop />
      <Header />

      <main id="main" className="relative z-[1]">
        <HowItWorks />
                <SampleReport />
        <FundingFirst />
                <Services />
        <Trust />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;