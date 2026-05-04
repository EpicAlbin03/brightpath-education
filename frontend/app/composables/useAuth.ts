export interface AuthUser {
  id: number
  username: string
  email: string
  role: 'viewer' | 'admin' | 'superuser'
  date_joined: string
}

function decodeExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null

export function useAuth() {
  const accessTokenCookie = useCookie<string | null>('access_token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
  const accessToken = useState<string | null>('auth:access', () => accessTokenCookie.value ?? null)
  const user = useState<AuthUser | null>('auth:user', () => null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(access: string) {
    accessToken.value = access
    accessTokenCookie.value = access
  }

  async function clearTokens() {
    accessToken.value = null
    accessTokenCookie.value = null
    user.value = null
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer)
    if (!accessToken.value) return
    const exp = decodeExp(accessToken.value)
    if (!exp) return
    const delay = Math.max(exp * 1000 - Date.now() - 60_000, 0)
    refreshTimer = setTimeout(async () => {
      try {
        const data = await $fetch<{ access: string }>('/api/auth/refresh', { method: 'POST' })
        setTokens(data.access)
        scheduleRefresh()
      } catch {
        logout()
      }
    }, delay)
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      user.value = await $fetch<AuthUser>('/api/auth/me')
    } catch {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ access: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setTokens(data.access)
    scheduleRefresh()
    await fetchMe()
    await navigateTo('/students')
  }

  async function loginWithGoogle(idToken: string) {
    const data = await $fetch<{ access: string; user: AuthUser }>('/api/auth/google', {
      method: 'POST',
      body: { id_token: idToken },
    })
    setTokens(data.access)
    user.value = data.user
    scheduleRefresh()
    await navigateTo('/students')
  }

  async function logout() {
    if (refreshTimer) clearTimeout(refreshTimer)
    await clearTokens()
    navigateTo('/login')
  }

  if (import.meta.client) {
    onMounted(() => {
      scheduleRefresh()
    })
  }

  return { user: readonly(user), isAuthenticated, login, loginWithGoogle, logout, fetchMe }
}
