import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasTag } from './lib/route';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = hasTag(pathname, 'middleware')

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon\\.ico).*)'],
};
