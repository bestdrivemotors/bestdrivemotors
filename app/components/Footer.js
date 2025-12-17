'use client';

import Link from 'next/link';
import { MdCall, MdMail } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-card-dark px-6 py-16 text-white md:px-12 lg:px-20">
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
            South Auckland's destination for quality used vehicles and competitive finance solutions. Excellence in every drive.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-lg bg-card-dark border border-border-subtle text-white hover:text-white hover:border-primary hover:bg-primary transition-all"
            >
              <span className="text-xs font-bold">FB</span>
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-lg bg-card-dark border border-border-subtle text-white hover:text-white hover:border-primary hover:bg-primary transition-all"
            >
              <span className="text-xs font-bold">IG</span>
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-lg bg-card-dark border border-border-subtle text-white hover:text-white hover:border-primary hover:bg-primary transition-all"
            >
              <span className="text-xs font-bold">YT</span>
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
              <a className="hover:text-primary transition-colors" href="tel:0800BESTDRIVE">
                022 435 3449
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <MdMail className="text-primary text-xl group-hover:scale-110 transition-transform" />
              <a
                className="hover:text-primary transition-colors"
                href="mailto:bestdrivemotors@outlook.co.nz"
              >
                bestdrivemotors@outlook.co.nz
              </a>
            </li>
          </ul>
        </div>

        {/* Explore Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Explore</h4>
          <ul className="flex flex-col gap-3 text-sm text-white">
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
        <p>© 2025 Best Drive Motors. All rights reserved.</p>
      </div>
    </footer>
  );
}
