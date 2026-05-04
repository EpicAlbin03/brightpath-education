<script setup lang="ts">
useSeoMeta({
	title: 'Privacy Policy | BrightPath Education',
	description:
		'Read the BrightPath Education privacy policy to understand how data is collected, used, and protected.'
});

const { data: privacy } = await useAsyncData(() =>
	queryCollection('content').path('/privacy').first()
);
</script>

<template>
	<main class="mx-auto prose p-4 dark:prose-invert">
		<ContentRenderer v-if="privacy" :value="privacy" />
		<p class="text-destructive" v-else>Failed to load Privacy Policy.</p>
	</main>
</template>
