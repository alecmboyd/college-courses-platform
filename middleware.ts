import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login/signup pages (to prevent 401 errors)
     * - auth callback pages
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|login|signup|auth|api|register|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}