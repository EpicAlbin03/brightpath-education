<script setup lang="ts">
import CreateCourseForm from '~/components/CreateCourseForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Student } from '~~/shared/types';

const { data, pending, status, error } = await useFetch<Student[]>('/api/students/');
const students = computed<Student[]>(() => data.value ?? []);
const isLoading = computed(() => status.value === 'idle' || pending.value);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Create Course" />
		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading students...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load students.</p>
		<CreateCourseForm
			v-else
			:students="students"
			@created="(course) => console.log('Course created:', course)"
		/>
	</section>
</template>
