import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logApiRequest } from '@/lib/logger';

/**
 * Middleware for logging and monitoring
 */
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Clone the response to add headers
  const response = NextResponse.next();
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  // Log the request after response is sent
  // Note: In Next.js middleware, we can't easily wait for the response
  // So we log the request immediately and track duration separately
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  
  // Skip logging for static assets and health checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/api/health'
  ) {
    return response;
  }
  
  // Log API requests
  if (pathname.startsWith('/api')) {
    // We'll log this in the API route itself for accurate status codes
    // But we can log the incoming request here
    const duration = Date.now() - startTime;
    logApiRequest(method, pathname + search, 0, duration, {
      requestId,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });
  }
  
  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
