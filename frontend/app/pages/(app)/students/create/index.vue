<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import CreateStudentForm from '~/components/CreateStudentForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Course } from '~~/shared/types';

useSeoMeta({
	title: 'Create Student | BrightPath Education',
	description:
		'Add a new student profile in BrightPath Education and assign courses during creation.'
});

const { data, pending, status, error } = await useFetch<Course[]>('/api/courses/');
const courses = computed<Course[]>(() => data.value ?? []);
const isLoading = computed(() => status.value === 'idle' || pending.value);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Create Student" />
		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading courses...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load courses.</p>
		<CreateStudentForm
			v-else
			:courses="courses"
			@created="(student) => console.log('Student created:', student)"
		/>
	</section>
</template>
