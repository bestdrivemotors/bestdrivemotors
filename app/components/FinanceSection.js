export default function FinanceSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden" id="finance">
      <div className="absolute inset-0 z-0">
        <img
          alt="Background"
          className="h-full w-full object-cover"
          style={{ opacity: 0.1 }}
          src="/finance-bg.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/120 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black-dark via-black/20 to-transparent"></div>
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-12 lg:px-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          Drive Your Dream Today
        </h2>
        <p className="mx-auto mt-4 md:mt-6 max-w-2xl text-base md:text-lg text-white px-4">
          Our finance specialists work with leading lenders to secure the best rates for you. Apply online in minutes
          with our secure application process.
        </p>
        <div className="mt-8 md:mt-10 flex flex-col items-center justify-center">
          <a
            className="flex w-full md:w-auto min-w-[200px] h-12 md:h-14 items-center justify-center gap-2 rounded-lg bg-primary px-6 md:px-8 text-sm md:text-base font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:bg-primary-hover hover:scale-105"
            href="/finance"
          >
            Start Application
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}
