import { vi } from 'vitest'

export function createMockSupabaseClient(overrides: Record<string, unknown> = {}) {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  })

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
}

export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'auth-user-123',
    email: 'test@example.com',
    ...overrides,
  }
}

export function createMockPublicUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'public-user-456',
    auth_id: 'auth-user-123',
    email: 'test@example.com',
    role: 'user' as const,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}
