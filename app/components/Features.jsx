 'use client';

import Link from 'next/link';
import { MdAccountBalance, MdArrowForward, MdCall, MdDirectionsCar } from 'react-icons/md';
import { dealershipContact } from '@/lib/contact';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

const features = [
  {
    icon: MdDirectionsCar,
    title: 'Explore available cars',
    description: 'Browse the vehicles currently in stock.',
    href: '/vehicles',
    action: 'View vehicles',
  },
  {
    icon: MdAccountBalance,
    title: 'Finance assistance',
    description: 'Learn about finance and start an application.',
    href: '/finance',
    action: 'Finance options',
    onClick: () => trackPublicAnalyticsEvent('finance_cta_click', { source: 'home' }),
  },
  {
    icon: MdCall,
    title: 'Talk with our team',
    description: `Call Best Drive Motors on ${dealershipContact.phone.label}.`,
    href: dealershipContact.phone.href,
    action: 'Call the dealership',
    onClick: () => trackPublicAnalyticsEvent('contact_click', { method: 'phone' }),
  },
];

export default function Features() {
  return (
    <section className="border-y border-neutral-200 bg-white px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Link
              key={feature.title}
              className="group flex min-h-32 items-start gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:px-6 md:first:pl-0 md:last:pr-0"
              href={feature.href}
              onClick={feature.onClick}
            >
              <span className="flex size-11 shrink-0 items-center justify-center bg-red-50 text-primary">
                <Icon aria-hidden="true" className="text-xl" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-neutral-950">{feature.title}</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-600">{feature.description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  {feature.action}
                  <MdArrowForward aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}