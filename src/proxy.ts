import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix to get actual path
  const localePattern = /^\/(en|fr)(\/.*)?$/
  const localeMatch = localePattern.exec(pathname)
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale
  const pathWithoutLocale = localeMatch ? (localeMatch[2] ?? '/') : pathname

  const isProtectedRoute =
    pathWithoutLocale.startsWith('/dashboard') ||
    pathWithoutLocale.startsWith('/admin')
  const isAdminRoute = pathWithoutLocale.startsWith('/admin')

  if (isProtectedRoute) {
    // Build a response base to attach cookies to
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdminRoute) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
      }
    }

    return supabaseResponse
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
