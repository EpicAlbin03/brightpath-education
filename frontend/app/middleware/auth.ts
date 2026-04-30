export default defineNuxtRouteMiddleware(() => {
  const accessToken = import.meta.client
    ? localStorage.getItem('access_token')
    : useState('auth:access').value

  if (!accessToken) {
    return navigateTo('/login')
  }
})
