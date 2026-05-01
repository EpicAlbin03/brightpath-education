<script setup lang="ts">
import EditCourseForm from '~/components/EditCourseForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Course } from '~/lib/types';

const route = useRoute();
const config = useRuntimeConfig();

const accessToken = import.meta.client ? localStorage.getItem('access_token') : null;

const {
	data: course,
	pending,
	error
} = await useFetch<Course>(() => `${config.public.apiBase}/courses/${route.params.id}/`, {
	server: false,
	headers: {
		Authorization: accessToken ? `Bearer ${accessToken}` : '',
		Accept: 'application/json'
	}
});
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Edit Course" />
		<p v-if="pending" class="text-sm text-muted-foreground">Loading course...</p>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load course.</p>
		<EditCourseForm v-else-if="course" :course="course" />
	</section>
</template>
