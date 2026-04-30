<script setup lang="ts">
const route = useRoute();

const layout = computed(() => (route.meta.groups?.includes('app') ? 'app' : false));
</script>

<template>
	<NuxtLayout :name="layout || undefined">
		<NuxtPage />
	</NuxtLayout>
</template>
