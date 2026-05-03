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
  const config = useRuntimeConfig()
  const accessTokenCookie = useCookie<string | null>('access_token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
  const accessToken = useState<string | null>('auth:access', () => accessTokenCookie.value ?? null)
  const refreshToken = useState<string | null>('auth:refresh', () =>
    import.meta.client ? localStorage.getItem('refresh_token') : null,
  )
  const user = useState<AuthUser | null>('auth:user', () => null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    accessTokenCookie.value = access
    refreshToken.value = refresh
    if (import.meta.client) {
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
    }
  }

  function clearTokens() {
    accessToken.value = null
    accessTokenCookie.value = null
    refreshToken.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer)
    if (!accessToken.value) return
    const exp = decodeExp(accessToken.value)
    if (!exp) return
    const delay = Math.max(exp * 1000 - Date.now() - 60_000, 0)
    refreshTimer = setTimeout(async () => {
      if (!refreshToken.value) return logout()
      try {
        const data = await $fetch<{ access: string }>(`${config.public.apiBase}/auth/refresh/`, {
          method: 'POST',
          body: { refresh: refreshToken.value },
        })
        setTokens(data.access, refreshToken.value!)
        scheduleRefresh()
      } catch {
        logout()
      }
    }, delay)
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      user.value = await $fetch<AuthUser>(`${config.public.apiBase}/auth/me/`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
    } catch {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ access: string; refresh: string }>(`${config.public.apiBase}/auth/login/`, {
      method: 'POST',
      body: { email, password },
    })
    setTokens(data.access, data.refresh)
    scheduleRefresh()
    await fetchMe()
    await navigateTo('/students')
  }

  async function loginWithGoogle(idToken: string) {
    const data = await $fetch<{ access: string; refresh: string; user: AuthUser }>(`${config.public.apiBase}/auth/google/`, {
      method: 'POST',
      body: { id_token: idToken },
    })
    setTokens(data.access, data.refresh)
    user.value = data.user
    scheduleRefresh()
    await navigateTo('/students')
  }

  function logout() {
    if (refreshTimer) clearTimeout(refreshTimer)
    clearTokens()
    navigateTo('/login')
  }

  if (import.meta.client) {
    onMounted(() => {
      // useState is initialised on the server where localStorage is unavailable,
      // so the refresh token is always null after hydration. Re-read it here.
      if (!refreshToken.value) {
        refreshToken.value = localStorage.getItem('refresh_token')
      }
      scheduleRefresh()
    })
  }

  return { user: readonly(user), isAuthenticated, login, loginWithGoogle, logout, fetchMe }
}
