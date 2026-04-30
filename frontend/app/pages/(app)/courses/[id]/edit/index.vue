<script setup lang="ts">
const route = useRoute();
</script>

<template>
	<section class="space-y-4">
		<h1 class="text-2xl font-semibold tracking-tight">Edit Course</h1>
		<p>{{ route.params.id }}</p>
	</section>
</template>
