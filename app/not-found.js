import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-background-dark overflow-hidden py-12 md:py-0 px-4 md:px-0">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-background-dark to-card-dark/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-2xl mx-auto w-full">
        {/* Icon */}
        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 md:w-32 h-24 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-red-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl md:text-8xl text-primary animate-pulse">
                directions_car
              </span>
            </div>
            <div className="absolute top-0 right-0 w-10 md:w-12 h-10 md:h-12 bg-red-500/30 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-6xl md:text-9xl lg:text-[120px] font-black text-primary leading-none tracking-tighter">
            4<span className="text-card-dark">0</span>4
          </h1>
          <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-primary via-red-500 to-transparent mx-auto mt-3 md:mt-4"></div>
        </div>

        {/* Message */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-black mb-2 md:mb-3 leading-tight">
            Oops! Page Not Found
          </h2>
          <p className="text-base md:text-lg text-text-muted mb-2 font-light">
            Looks like this vehicle has left the lot. The page you're looking for doesn't exist.
          </p>
          <p className="text-xs md:text-sm text-text-muted/70">
            But don't worry, we have plenty of other great options for you!
          </p>
        </div>

        {/* Suggestions */}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white font-bold uppercase tracking-wide rounded-lg transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] text-sm md:text-base w-full md:w-auto"
          >
            <span className="material-symbols-outlined">home</span>
            Back to Home
          </Link>
          <Link
            href="/finance"
            className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-card-dark hover:bg-card-dark/80 text-white font-bold uppercase tracking-wide rounded-lg transition-all hover:scale-[1.02] border border-primary/30 hover:border-primary text-sm md:text-base w-full md:w-auto"
          >
            <span className="material-symbols-outlined">directions_car</span>
            Finance Application
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 w-20 h-20 border-2 border-primary/20 rounded-lg transform -rotate-45 opacity-30"></div>
      <div className="absolute top-20 right-20 w-12 h-12 bg-primary/10 rounded-full opacity-50"></div>
    </main>
  );
}
