<script setup lang="ts">
import { Mail, Lock, Chrome } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const { login, loginWithGoogle } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
  } catch (e: unknown) {
    const err = e as { data?: { detail?: string } }
    error.value = err?.data?.detail ?? 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}

function initGoogle() {
  if (!config.public.googleClientId) return
  window.google?.accounts.id.initialize({
    client_id: config.public.googleClientId,
    callback: async (response: { credential: string }) => {
      googleLoading.value = true
      error.value = ''
      try {
        await loginWithGoogle(response.credential)
      } catch {
        error.value = 'Google sign-in failed. Please try again.'
      } finally {
        googleLoading.value = false
      }
    },
  })
}

useHead({
  script: config.public.googleClientId
    ? [{ src: 'https://accounts.google.com/gsi/client', onload: 'window.__gsiReady=true' }]
    : [],
})

onMounted(() => {
  if (!config.public.googleClientId) return
  const tryInit = () => {
    if (window.google?.accounts) {
      initGoogle()
    } else {
      setTimeout(tryInit, 200)
    }
  }
  tryInit()
})

function handleGoogleClick() {
  if (!config.public.googleClientId) {
    error.value = 'Google sign-in is not configured.'
    return
  }
  window.google?.accounts.id.prompt()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm space-y-6">
      <div class="text-center space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">BrightPath</h1>
        <p class="text-sm text-muted-foreground">Education platform</p>
      </div>

      <Card>
        <CardHeader class="space-y-1 pb-4">
          <CardTitle class="text-lg">Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <form class="space-y-3" @submit.prevent="handleLogin">
            <div class="space-y-1.5">
              <Label for="email">Email</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="pl-9"
                  autocomplete="email"
                  required
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <Label for="password">Password</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  class="pl-9"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>

            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

            <Button type="submit" class="w-full" :disabled="loading">
              <span v-if="loading">Signing in…</span>
              <span v-else>Sign in</span>
            </Button>
          </form>

          <div class="relative">
            <Separator />
            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button variant="outline" class="w-full" :disabled="googleLoading" @click="handleGoogleClick">
            <Chrome class="size-4" />
            <span>{{ googleLoading ? 'Redirecting…' : 'Continue with Google' }}</span>
          </Button>
        </CardContent>

        <CardFooter class="pt-0">
          <p class="text-center w-full text-sm text-muted-foreground">
            Don't have an account?
            <NuxtLink to="/register" class="text-foreground underline underline-offset-4 hover:text-primary">
              Register
            </NuxtLink>
          </p>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
