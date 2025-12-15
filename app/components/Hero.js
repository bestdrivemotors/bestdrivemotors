import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img
          alt="Luxury Car"
          className="h-full w-full object-cover opacity-60"
          src="/hero-bg.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/40 to-transparent"></div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              South Auckland's Dealership
            </span>
          </div>
          <h1 className="font-display text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Driven by <br /> <span className="text-primary">Excellence.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-muted leading-relaxed">
            Discover a curated collection of premium vehicles tailored to your lifestyle.
            Exceptional quality, competitive finance, and service you can trust.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#stock"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:bg-primary-hover hover:-translate-y-1"
            >
              View Stock
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
