<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import EditStudentForm from '~/components/EditStudentForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Course, StudentIncludeCourses } from '~~/shared/types';

const route = useRoute();

useSeoMeta({
	title: () =>
		student.value
			? `Edit ${student.value.name} | BrightPath Education`
			: 'Edit Student | BrightPath Education',
	description: () =>
		student.value
			? `Update student information and course assignments for ${student.value.name}.`
			: 'Update student records and course assignments in BrightPath Education.'
});

const [studentResponse, coursesResponse] = await Promise.all([
	useFetch<StudentIncludeCourses>(`/api/students/${route.params.id}/?include=courses`),
	useFetch<Course[]>('/api/courses/')
]);

const student = computed<StudentIncludeCourses | null>(() => studentResponse.data.value ?? null);
const courses = computed<Course[]>(() => coursesResponse.data.value ?? []);
const error = computed(() => studentResponse.error.value ?? coursesResponse.error.value);
const isLoading = computed(
	() =>
		studentResponse.status.value === 'idle' ||
		coursesResponse.status.value === 'idle' ||
		studentResponse.pending.value ||
		coursesResponse.pending.value
);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Edit Student" />
		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading student data...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load student data.</p>
		<EditStudentForm v-else-if="student" :student="student" :courses="courses" />
	</section>
</template>
