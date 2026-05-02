<script setup lang="ts">
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';

const route = useRoute();

const layout = computed(() => (route.meta.groups?.includes('app') ? 'app' : false));
</script>

<template>
	<NuxtLayout :name="layout || undefined">
		<NuxtPage />
	</NuxtLayout>
	<Toaster />
</template>
