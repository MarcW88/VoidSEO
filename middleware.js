// Middleware for route protection
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/api/protected']
  const adminRoutes = ['/admin']
  const currentPath = req.nextUrl.pathname

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    currentPath.startsWith(route)
  )
  
  const isAdminRoute = adminRoutes.some(route => 
    currentPath.startsWith(route)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', currentPath)
    return NextResponse.redirect(redirectUrl)
  }

  // For admin routes, check role
  if (isAdminRoute && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/free.html', req.url))
    }

    // Optional: IP allowlist for admin (if configured)
    const adminIpAllowlist = process.env.ADMIN_IP_ALLOWLIST?.split(',') || []
    if (adminIpAllowlist.length > 0) {
      const clientIp = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      req.ip || 
                      '127.0.0.1'
      
      if (!adminIpAllowlist.includes(clientIp.split(',')[0].trim())) {
        console.warn(`Admin access denied for IP: ${clientIp}`)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }

  // Update last login timestamp
  if (session && isProtectedRoute) {
    // Don't await this to avoid slowing down the request
    supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', session.user.id)
      .then(() => {})
      .catch(() => {})
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // CSP (Content Security Policy)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|css|js).*)',
  ],
}
