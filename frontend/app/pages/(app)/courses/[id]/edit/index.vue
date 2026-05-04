<script setup lang="ts">
definePageMeta({ middleware: 'admin' });
import { LoaderCircle } from 'lucide-vue-next';
import EditCourseForm from '~/components/EditCourseForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { CourseIncludeStudents, Student } from '~~/shared/types';

const route = useRoute();

const [courseResponse, studentsResponse] = await Promise.all([
	useFetch<CourseIncludeStudents>(`/api/courses/${route.params.id}/?include=students`),
	useFetch<Student[]>('/api/students/')
]);

const course = computed<CourseIncludeStudents | null>(() => courseResponse.data.value ?? null);
const students = computed<Student[]>(() => studentsResponse.data.value ?? []);
const error = computed(() => courseResponse.error.value ?? studentsResponse.error.value);
const isLoading = computed(
	() =>
		courseResponse.status.value === 'idle' ||
		studentsResponse.status.value === 'idle' ||
		courseResponse.pending.value ||
		studentsResponse.pending.value
);

useSeoMeta({
	title: () =>
		course.value
			? `Edit ${course.value.name} | BrightPath Education`
			: 'Edit Course | BrightPath Education',
	description: () =>
		course.value
			? `Update course details and student enrollments for ${course.value.name}.`
			: 'Update course details and assigned students in BrightPath Education.'
});
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Edit Course" />
		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading course data...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load course data.</p>
		<EditCourseForm v-else-if="course" :course="course" :students="students" />
	</section>
</template>
