export default defineNuxtRouteMiddleware(async () => {
  const accessToken = useCookie<string | null>('access_token')

  if (!accessToken.value) {
    return navigateTo('/login')
  }

  const { user, fetchMe } = useAuth()
  if (!user.value) {
    await fetchMe()
  }

  if (user.value?.role !== 'superuser') {
    return navigateTo('/students')
  }
})
