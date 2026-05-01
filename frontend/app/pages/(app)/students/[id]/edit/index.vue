<script setup lang="ts">
import EditStudentForm from '~/components/EditStudentForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { Student } from '~/lib/types';

const route = useRoute();
const config = useRuntimeConfig();

const accessToken = import.meta.client ? localStorage.getItem('access_token') : null;

const {
	data: student,
	pending,
	error
} = await useFetch<Student>(() => `${config.public.apiBase}/students/${route.params.id}/`, {
	server: false,
	headers: {
		Authorization: accessToken ? `Bearer ${accessToken}` : '',
		Accept: 'application/json'
	}
});
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Edit Student" />
		<p v-if="pending" class="text-sm text-muted-foreground">Loading student...</p>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load student.</p>
		<EditStudentForm v-else-if="student" :student="student" />
	</section>
</template>
