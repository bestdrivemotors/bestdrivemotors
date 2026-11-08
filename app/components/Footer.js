'use client';

import Link from 'next/link';
import { MdCall, MdMail } from 'react-icons/md';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { dealershipContact } from '@/lib/contact';
import { trackPublicAnalyticsEvent } from '@/lib/analytics/events';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <Link href="/">
            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              BEST DRIVE
            </h2>
            <h2 className="text-3xl font-black tracking-tight text-primary md:text-4xl" style={{ letterSpacing: '0.265em' }}>
              MOTORS
            </h2>
          </Link>
          <p className="text-sm text-white leading-relaxed">
            Used vehicles and finance assistance in South Auckland.
          </p>
          <div className="flex gap-4">
            <a
              aria-label="Best Drive Motors on Facebook"
              href="https://www.facebook.com/bestdrivemotors"
              className="flex size-10 items-center justify-center border border-white/20 text-white transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <FaFacebookF aria-hidden="true" />
            </a>
            <a
              aria-label="Best Drive Motors on Instagram"
              href="https://www.instagram.com/bestdrivemotors"
              className="flex size-10 items-center justify-center border border-white/20 text-white transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <FaInstagram aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-sm text-white">
            {/* <li className="flex items-start gap-3 group">
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                location_on
              </span>
              <span>
                123 Great South Road,
                <br />
                Manukau, Auckland 2104
              </span>
            </li> */}
            <li className="flex items-center gap-3 group">
              <MdCall className="text-primary text-xl group-hover:scale-110 transition-transform" />
              <a className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href={dealershipContact.phone.href} onClick={() => trackPublicAnalyticsEvent('contact_click', { method: 'phone' })}>
                {dealershipContact.phone.label}
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <MdMail className="text-primary text-xl group-hover:scale-110 transition-transform" />
              <a
                className="hover:text-primary transition-colors"
                href={dealershipContact.email.href}
                onClick={() => trackPublicAnalyticsEvent('contact_click', { method: 'email' })}
              >
                {dealershipContact.email.label}
              </a>
            </li>
          </ul>
        </div>

        {/* Explore Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Explore</h4>
          <ul className="flex flex-col gap-3 text-sm text-white">
            <li>
              <Link className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="/vehicles">
                Vehicles
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="/search">
                Search
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                href="/"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                href="/finance"
              >
                Finance Options
              </Link>
            </li>
          </ul>
        </div>

        {/* Opening Hours Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Opening Hours</h4>
          <ul className="flex flex-col gap-3 text-sm text-white">
            <li className="flex justify-between border-b border-border-subtle/50 pb-2">
              <span>Mon - Fri</span>
              <span className="text-white font-medium">8:30am - 5:30pm</span>
            </li>
            <li className="flex justify-between border-b border-border-subtle/50 pb-2">
              <span>Saturday</span>
              <span className="text-white font-medium">9:00am - 5:00pm</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday</span>
              <span className="text-white font-medium">10:00am - 4:00pm</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-border-subtle pt-8 text-xs text-white gap-4">
        <p>Best Drive Motors. All rights reserved.</p>
      </div>
    </footer>
  );
}
