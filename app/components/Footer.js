import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-card-dark px-6 py-16 text-white md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <h3 className="font-display text-xl font-black">
            Best Drive <span className="text-primary">Motors</span>
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            South Auckland's destination for quality used vehicles and competitive finance solutions. Excellence in every drive.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-lg bg-background-dark border border-border-subtle text-text-muted hover:text-white hover:border-primary hover:bg-primary transition-all"
            >
              <span className="text-xs font-bold">FB</span>
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-lg bg-background-dark border border-border-subtle text-text-muted hover:text-white hover:border-primary hover:bg-primary transition-all"
            >
              <span className="text-xs font-bold">IG</span>
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-lg bg-background-dark border border-border-subtle text-text-muted hover:text-white hover:border-primary hover:bg-primary transition-all"
            >
              <span className="text-xs font-bold">YT</span>
            </a>
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-sm text-text-muted">
            <li className="flex items-start gap-3 group">
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                location_on
              </span>
              <span>
                123 Great South Road,
                <br />
                Manukau, Auckland 2104
              </span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                call
              </span>
              <a className="hover:text-primary transition-colors" href="tel:0800BESTDRIVE">
                0800 BEST DRIVE
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                mail
              </span>
              <a
                className="hover:text-primary transition-colors"
                href="mailto:sales@bestdrive.co.nz"
              >
                sales@bestdrive.co.nz
              </a>
            </li>
          </ul>
        </div>

        {/* Explore Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Explore</h4>
          <ul className="flex flex-col gap-3 text-sm text-text-muted">
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
                href="/stock"
              >
                Our Inventory
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
            <li>
              <Link
                className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                href="#"
              >
                Sell Your Car
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary hover:translate-x-1 inline-block transition-all"
                href="#"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Opening Hours Section */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold text-white font-display">Opening Hours</h4>
          <ul className="flex flex-col gap-3 text-sm text-text-muted">
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
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-border-subtle pt-8 text-xs text-text-muted gap-4">
        <p>© 2024 Best Drive Motors. All rights reserved.</p>
        <div className="flex gap-6">
          <Link className="hover:text-white transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="hover:text-white transition-colors" href="#">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
