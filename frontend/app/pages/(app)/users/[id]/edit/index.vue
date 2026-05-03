<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import EditUserForm from '~/components/EditUserForm.vue';
import PageTitle from '~/components/PageTitle.vue';
import type { AppUser } from '~~/shared/types';

definePageMeta({ middleware: 'superuser' });

const route = useRoute();

useSeoMeta({
	title: () =>
		user.value
			? `Edit ${user.value.username} | BrightPath Education`
			: 'Edit User | BrightPath Education',
	description: () =>
		user.value
			? `Update account details and permissions for ${user.value.username}.`
			: 'Update user account details and permissions in BrightPath Education.'
});

const { data, pending, status, error } = await useFetch<AppUser>(`/api/users/${route.params.id}`);

const user = computed<AppUser | null>(() => data.value ?? null);
const isLoading = computed(() => status.value === 'idle' || pending.value);

function handleUpdated(updated: AppUser) {
	data.value = updated;
}
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Edit User" />

		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading user...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load user.</p>
		<EditUserForm v-else-if="user" :user="user" @updated="handleUpdated" />
	</section>
</template>
