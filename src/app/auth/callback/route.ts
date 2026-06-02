import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'
import { routing } from '@/i18n/routing'

const ALLOWED_OTP_TYPES: ReadonlySet<EmailOtpType> = new Set([
  'magiclink',
  'signup',
  'invite',
  'recovery',
  'email_change',
  'email',
])

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_OTP_TYPES.has(value as EmailOtpType)
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const cookieStore = await cookies()
  const locale =
    cookieStore.get('NEXT_LOCALE')?.value ?? routing.defaultLocale

  const loginFailureUrl = `${origin}/${locale}/login?error=auth`

  if (!tokenHash || !isEmailOtpType(type)) {
    return NextResponse.redirect(loginFailureUrl)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error || !user) {
    return NextResponse.redirect(loginFailureUrl)
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!existingUser) {
    await supabase.from('users').insert({
      auth_id: user.id,
      email: user.email,
      role: 'user',
    })
    if (user.email) {
      sendWelcomeEmail(user.email).catch(console.error)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/dashboard`)
}
