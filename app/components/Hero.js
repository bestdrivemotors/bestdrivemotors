import Link from 'next/link';
import { MdArrowForward } from 'react-icons/md';

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden md:p-10 p-5">
      <div className="absolute inset-0 z-0">
        <img
          alt="Luxury Car"
          className="h-full w-full object-cover opacity-60"
          src="/hero-bg.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/120 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black-dark via-black/20 to-transparent"></div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              South Auckland's Dealership
            </span>
          </div>
          <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-white">
            Driven by <br /> <span className="text-primary">Excellence.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white leading-relaxed">
            Discover a curated collection of premium vehicles tailored to your lifestyle.
            Exceptional quality, competitive finance, and service you can trust.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#stock"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:bg-primary-hover hover:-translate-y-1"
            >
              View Stock
              <MdArrowForward className="text-lg" />
            </Link>
            <Link
              href="/finance"
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-primary/50 hover:text-primary hover:-translate-y-1"
            >
              Apply for Finance
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
