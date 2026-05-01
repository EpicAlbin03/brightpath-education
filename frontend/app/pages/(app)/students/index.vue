<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import PageTitle from '~/components/PageTitle.vue';
import StudentsDataTable from '~/components/StudentsDataTable.vue';
import type { Student } from '~/lib/types';

const config = useRuntimeConfig();
const accessToken = import.meta.client ? localStorage.getItem('access_token') : null;

const {
	data: studentsResponse,
	pending,
	status,
	error
} = await useFetch<Student[]>(() => `${config.public.apiBase}/students/`, {
	server: false,
	headers: {
		Authorization: accessToken ? `Bearer ${accessToken}` : '',
		Accept: 'application/json'
	}
});

const students = computed<Student[]>(() =>
	(studentsResponse.value ?? [])
		.map((student) => ({
			id: student.id,
			name: student.name,
			email: student.email,
			date_of_birth: student.date_of_birth,
			grade: student.grade,
			is_active: student.is_active,
			course_count: student.course_count
		}))
		.sort((a, b) => a.id - b.id)
);

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
