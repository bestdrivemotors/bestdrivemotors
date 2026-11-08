'use client';

import Link from 'next/link';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

export default function VehicleContactActions({ phoneHref, phoneLabel }) {
  function trackPhoneClick() {
    trackPublicAnalyticsEvent('contact_click', { method: 'phone' });
  }

  function trackFinanceClick() {
    trackPublicAnalyticsEvent('finance_cta_click', { source: 'vehicle_detail' });
  }

  return (
    <>
      <div className="mt-6 hidden gap-3 sm:flex sm:flex-wrap">
        <a className="inline-flex min-h-12 items-center justify-center bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" href={phoneHref} onClick={trackPhoneClick}>
          Call {phoneLabel}
        </a>
        <Link className="inline-flex min-h-12 items-center justify-center border border-zinc-400 px-5 text-sm font-bold text-zinc-950 hover:border-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" href="/finance" onClick={trackFinanceClick}>
          Explore finance options
        </Link>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-3 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <a className="inline-flex min-h-12 items-center justify-center bg-red-700 px-3 text-center text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" href={phoneHref} onClick={trackPhoneClick}>
          Call dealership
        </a>
        <Link className="inline-flex min-h-12 items-center justify-center border border-zinc-400 px-3 text-center text-sm font-bold text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" href="/finance" onClick={trackFinanceClick}>
          Finance options
        </Link>
      </div>
    </>
  );
}