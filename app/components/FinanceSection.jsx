'use client';

import Image from 'next/image';
import { MdArrowForward } from 'react-icons/md';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

export default function FinanceSection() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-16 md:py-20" id="finance">
      <div className="absolute inset-0 z-0">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="100vw"
          src="/finance-bg.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/55" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase text-white/65">Finance assistance</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            Explore your finance options
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Read about vehicle finance and use our online application to get started.
          </p>
          <a
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            href="/finance"
            onClick={() => trackPublicAnalyticsEvent('finance_cta_click', { source: 'home' })}
          >
            Start an application
            <MdArrowForward aria-hidden="true" className="text-lg" />
          </a>
        </div>
      </div>
    </section>
  );
}