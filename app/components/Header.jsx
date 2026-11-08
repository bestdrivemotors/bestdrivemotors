import Link from 'next/link';
import { MdCall } from 'react-icons/md';
import { dealershipContact } from '@/lib/contact';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link aria-label="Best Drive Motors home" className="flex shrink-0 flex-col leading-none" href="/">
          <span className="text-xl font-black text-white sm:text-2xl">BEST DRIVE</span>
          <span className="mt-1 text-sm font-bold text-primary sm:text-base">MOTORS</span>
        </Link>

        <a
          aria-label={`Call ${dealershipContact.phone.label}`}
          className="inline-flex size-11 items-center justify-center gap-2 border border-white/25 text-sm font-bold transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:px-4"
          href={dealershipContact.phone.href}
          onClick={() => trackPublicAnalyticsEvent('contact_click', { method: 'phone' })}
          title={`Call ${dealershipContact.phone.label}`}
        >
          <MdCall aria-hidden="true" className="text-lg" />
          <span className="sr-only sm:not-sr-only">{dealershipContact.phone.label}</span>
        </a>

        <nav
          aria-label="Main navigation"
          className="order-3 flex basis-full items-center justify-between border-t border-white/10 pt-2 text-sm font-semibold lg:order-none lg:ml-auto lg:basis-auto lg:gap-7 lg:border-0 lg:pt-0"
        >
          <Link className="px-2 py-2 text-white/85 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" href="/vehicles">
            Vehicles
          </Link>
          <Link className="px-2 py-2 text-white/85 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" href="/search">
            Search
          </Link>
          <Link className="px-2 py-2 text-white/85 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" href="/finance" onClick={() => trackPublicAnalyticsEvent('finance_cta_click', { source: 'navigation' })}>
            Finance
          </Link>
        </nav>
      </div>
    </header>
  );
}