<script setup lang="ts">
const { data: privacy } = await useAsyncData(() =>
	queryCollection('content').path('/privacy').first()
);
</script>

<template>
	<main class="prose dark:prose-invert mx-auto p-4">
		<ContentRenderer v-if="privacy" :value="privacy" />
		<p class="text-destructive" v-else>Failed to load Privacy Policy.</p>
	</main>
</template>
