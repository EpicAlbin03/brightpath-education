<script setup lang="ts">
definePageMeta({
  middleware: [
    () => {
      const accessToken = useCookie<string | null>('access_token')
      if (accessToken.value) {
        return navigateTo('/students', { replace: true })
      }
      return navigateTo('/login', { replace: true })
    }
  ]
})
</script>

<template>
  <div />
</template>
