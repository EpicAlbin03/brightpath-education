<script setup lang="ts">
import CreateCourseForm from '~/components/CreateCourseForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Student } from '~/lib/types';

const config = useRuntimeConfig();
const accessToken = import.meta.client ? localStorage.getItem('access_token') : null;

const {
	data: studentsResponse,
	pending,
	error
} = await useFetch<Student[]>(() => `${config.public.apiBase}/students/`, {
	server: false,
	headers: {
		Authorization: accessToken ? `Bearer ${accessToken}` : '',
		Accept: 'application/json'
	}
});

const students = computed<Student[]>(() =>
	(studentsResponse.value ?? []).sort((a, b) => a.id - b.id)
);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Create Course" />
		<p v-if="pending" class="text-sm text-muted-foreground">Loading students...</p>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load students.</p>
		<CreateCourseForm
			v-else
			:students="students"
			@created="(course) => console.log('Course created:', course)"
		/>
	</section>
</template>
