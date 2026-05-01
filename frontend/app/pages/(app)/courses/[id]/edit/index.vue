<script setup lang="ts">
import EditCourseForm from '~/components/EditCourseForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Course, Student } from '~/lib/types';

const route = useRoute();
const config = useRuntimeConfig();

const accessToken = import.meta.client ? localStorage.getItem('access_token') : null;

const {
	data: course,
	pending: coursePending,
	error: courseError
} = await useFetch<Course>(
	() => `${config.public.apiBase}/courses/${route.params.id}?include=students`,
	{
		server: false,
		headers: {
			Authorization: accessToken ? `Bearer ${accessToken}` : '',
			Accept: 'application/json'
		}
	}
);

const {
	data: studentsResponse,
	pending: studentsPending,
	error: studentsError
} = await useFetch<Student[]>(() => `${config.public.apiBase}/students/`, {
	server: false,
	headers: {
		Authorization: accessToken ? `Bearer ${accessToken}` : '',
		Accept: 'application/json'
	}
});

const pending = computed(() => coursePending.value || studentsPending.value);
const error = computed(() => courseError.value || studentsError.value);
const students = computed<Student[]>(() =>
	(studentsResponse.value ?? []).sort((a, b) => a.id - b.id)
);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Edit Course" />
		<p v-if="pending" class="text-sm text-muted-foreground">Loading course...</p>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load course.</p>
		<EditCourseForm v-else-if="course" :course="course" :students="students" />
	</section>
</template>
