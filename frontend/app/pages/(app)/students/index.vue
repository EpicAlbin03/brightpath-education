<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import PageTitle from '~/components/PageTitle.vue';
import StudentsDataTable from '~/components/StudentsDataTable.vue';
import type { Student } from '~~/shared/types';

useSeoMeta({
	title: 'Students | BrightPath Education',
	description:
		'Browse and manage student records, enrollment status, and related information in BrightPath Education.'
});

const { data, pending, status, error } = await useFetch<Student[]>('/api/students/');
const students = computed<Student[]>(() => data.value ?? []);
const isLoading = computed(() => status.value === 'idle' || pending.value);
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Students" description="List of all students" />

		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading students...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load students.</p>
		<StudentsDataTable v-else :students="students" />
	</section>
</template>
