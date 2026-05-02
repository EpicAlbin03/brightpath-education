// Placeholder home page that shows user info and allows logging out
<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({ layout: 'app' })

const router = useRouter()
router.replace('/students')

const { user, logout, fetchMe } = useAuth()

onMounted(async () => {
  if (!user.value) {
    await fetchMe()
  }
})

const roleBadgeClass = computed(() => {
  if (user.value?.role === 'superuser') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  if (user.value?.role === 'admin') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg">BrightPath</CardTitle>
          <span
            v-if="user"
            class="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
            :class="roleBadgeClass"
          >
            {{ user.role }}
          </span>
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <div v-if="user" class="space-y-1">
          <p class="text-sm text-muted-foreground">Welcome back,</p>
          <p class="text-xl font-semibold">{{ user.username }}</p>
          <p class="text-sm text-muted-foreground">{{ user.email }}</p>
        </div>
        <div v-else class="h-16 flex items-center">
          <p class="text-sm text-muted-foreground">Loading…</p>
        </div>

        <Button variant="outline" class="w-full" @click="logout">
          <LogOut class="size-4" />
          Log out
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
