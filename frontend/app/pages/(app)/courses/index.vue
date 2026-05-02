<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import CoursesDataTable from '~/components/CoursesDataTable.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Course } from '~/lib/types';

const config = useRuntimeConfig();
const accessToken = import.meta.client ? localStorage.getItem('access_token') : null;

const {
	data: coursesResponse,
	pending,
	status,
	error
} = await useFetch<Course[]>(() => `${config.public.apiBase}/courses/`, {
	server: false,
	headers: {
		Authorization: accessToken ? `Bearer ${accessToken}` : '',
		Accept: 'application/json'
	}
});

const courses = computed<Course[]>(() =>
	(coursesResponse.value ?? [])
		.map((course) => ({
			id: course.id,
			name: course.name,
			code: course.code,
			description: course.description,
			student_count: course.student_count
		}))
		.sort((a, b) => a.id - b.id)
);

const isLoading = computed(() => status.value === 'idle' || pending.value);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Courses" description="List of all courses" />

		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading courses...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load courses.</p>
		<CoursesDataTable v-else :courses="courses" />
	</section>
</template>
