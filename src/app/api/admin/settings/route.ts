import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── GET /api/admin/settings ─────────────────────────────────────────────────
// Public: any visitor can read the themeAnimation setting
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'themeAnimation')
    .single()

  if (error) {
    // If the row doesn't exist yet, return the default
    return NextResponse.json({ enabled: true })
  }

  return NextResponse.json({ enabled: (data.value as { enabled: boolean }).enabled ?? true })
}

// ── PUT /api/admin/settings ─────────────────────────────────────────────────
// Admin only: update the themeAnimation setting
export async function PUT(request: NextRequest) {
  // Verify the user is authenticated and is an admin
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin status via RPC
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  if (typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body: enabled must be a boolean' }, { status: 400 })
  }

  // Use admin client to bypass RLS for the upsert
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('site_config')
    .upsert(
      { key: 'themeAnimation', value: { enabled: body.enabled }, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ enabled: body.enabled })
}
