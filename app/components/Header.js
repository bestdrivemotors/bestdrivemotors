import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="relative top-0 z-50 w-full border-b border-border-subtle bg-background-dark/90 px-6 py-4 backdrop-blur-md md:px-12 lg:px-20 transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-3">
          {/* <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">directions_car</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white lg:text-2xl font-display">
            Best Drive <span className="text-primary">Motors</span>
          </h2> */}
          <Link  href="/">
            <Image className='' width={"130"} alt='best-deal-motors-logo' loading="eager" height={"20"} src={'/best-deal-motors-logo.png'}    />
          </Link>
        </div>

        {/* Finance Button */}
        <Link
          href="/finance"
          className="group h-10 cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold tracking-wide text-white transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {/* <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span> */}
          <span>Finance</span>
        </Link>
      </div>
    </header>
  );
}
