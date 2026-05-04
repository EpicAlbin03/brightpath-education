export default defineNuxtRouteMiddleware((to) => {
  const accessToken = useCookie<string | null>('access_token')

  const authRoutes = ['/login', '/register']
  if (authRoutes.includes(to.path)) {
    if (accessToken.value) {
      return navigateTo('/students')
    }
    return
  }

  if (!accessToken.value) {
    return navigateTo('/login')
  }
})
