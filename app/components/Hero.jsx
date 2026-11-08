 'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MdArrowForward, MdCall } from 'react-icons/md';
import { dealershipContact } from '@/lib/contact';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-neutral-950 px-5 py-16 sm:min-h-[600px] sm:px-8 lg:min-h-[680px] lg:px-12">
      <div className="absolute inset-0">
        <Image
          alt=""
          className="object-cover object-[center_58%] opacity-100 brightness-[1.8]"
          fill
          priority
          sizes="100vw"
          src="/hero-bg.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-bold uppercase text-white/75">
            Best Drive Motors <span aria-hidden="true" className="mx-2 text-primary">/</span> South Auckland
          </p>
          <h1 className="max-w-xl font-display text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Your next car
            <span className="block text-primary">starts here.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
            Explore the vehicles currently available, or call our South Auckland team to ask about a car.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={dealershipContact.phone.href}
              onClick={() => trackPublicAnalyticsEvent('contact_click', { method: 'phone' })}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <MdCall aria-hidden="true" className="text-lg" />
              Call {dealershipContact.phone.label}
            </Link>
            <Link
              href="/vehicles"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/50 bg-black/25 px-6 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Browse available cars
              <MdArrowForward aria-hidden="true" className="text-lg" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}