import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is localStorage-based (MVP) — cannot be read in middleware (Edge Runtime).
// Route protection is handled client-side in dashboard/layout.tsx.
// TODO: when auth migrates to httpOnly cookies, add cookie check here.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
