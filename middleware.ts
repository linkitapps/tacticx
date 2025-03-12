import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Set headers to bypass authentication
  const response = NextResponse.next()
  
  // Add headers to bypass OIDC authentication if needed
  response.headers.set('X-Bypass-Authentication', 'true')
  response.headers.set('Access-Control-Allow-Origin', '*')
  
  return response
}

// Apply middleware to all routes
export const config = {
  matcher: ['/((?!api/bypass-auth|_next/static|_next/image|favicon.ico).*)'],
} 