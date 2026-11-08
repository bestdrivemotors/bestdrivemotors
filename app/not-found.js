import Link from 'next/link';
import { MdArrowForward, MdCall, MdDirectionsCar } from 'react-icons/md';
import { dealershipContact } from '@/lib/contact';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[65vh] items-center bg-zinc-50 px-5 py-16 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-bold uppercase text-primary">Best Drive Motors / 404</p>
        <div className="mt-5 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl font-black leading-[1.05] sm:text-6xl">
              That page isn&apos;t here.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
              Return to the available vehicles, head back to the home page, or call the dealership.
            </p>
          </div>
          <span aria-hidden="true" className="hidden border-l border-zinc-300 pl-8 text-7xl text-primary md:block">
            404
          </span>
        </div>
        <nav aria-label="Page recovery" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/vehicles">
            <MdDirectionsCar aria-hidden="true" /> Browse available cars <MdArrowForward aria-hidden="true" />
          </Link>
          <Link className="inline-flex min-h-12 items-center justify-center border border-zinc-300 bg-white px-5 text-sm font-bold text-zinc-950 hover:border-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/">
            Go to home
          </Link>
          <a className="inline-flex min-h-12 items-center justify-center gap-2 border border-zinc-300 bg-white px-5 text-sm font-bold text-zinc-950 hover:border-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href={dealershipContact.phone.href}>
            <MdCall aria-hidden="true" /> Call {dealershipContact.phone.label}
          </a>
        </nav>
      </div>
    </main>
  );
}
