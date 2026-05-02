<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import PageTitle from '~/components/PageTitle.vue';
import StudentsDataTable from '~/components/StudentsDataTable.vue';
import type { Student } from '~/lib/types';

const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

const {
	data: studentsResponse,
	pending,
	refresh: refreshStudents,
	error
} = await useFetch<Student[]>('/api/students/', {
	headers: requestHeaders
});

const students = computed<Student[]>(() =>
	[...(studentsResponse.value ?? [])].sort((a, b) => a.id - b.id)
);

const isLoading = computed(() => pending.value && !studentsResponse.value);

async function handleRefreshStudents() {
	await refreshStudents();
}
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Students" description="List of all students" />

		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading students...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load students.</p>
		<StudentsDataTable v-else :students="students" @refresh="handleRefreshStudents" />
	</section>
</template>
