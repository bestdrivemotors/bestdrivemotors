'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';

const navigation = [
  { href: '/admin/vehicles', label: 'Vehicles' },
  { href: '/admin/lookups', label: 'Lookups' },
  { href: '/admin/team', label: 'Team' },
];

export default function AdminFrame({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/admin/login') return children;

  async function signOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="text-sm font-black uppercase tracking-wide" href="/admin/vehicles">
            Best Drive <span className="text-red-500">Admin</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <nav aria-label="Admin" className="flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                  className={`px-3 py-2 text-sm font-semibold transition-colors ${pathname.startsWith(item.href) ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              aria-label="Sign out"
              className="inline-flex size-10 items-center justify-center text-zinc-300 hover:bg-zinc-900 hover:text-white"
              onClick={signOut}
              title="Sign out"
              type="button"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}