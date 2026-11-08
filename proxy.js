import { NextResponse } from 'next/server';
import { getAuth, isAuthConfigured } from '@/lib/auth/index';

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/admin/login') return NextResponse.next();

  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (session) return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};