<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import PageTitle from '~/components/PageTitle.vue';
import UsersDataTable from '~/components/UsersDataTable.vue';
import type { AppUser } from '~~/shared/types';

definePageMeta({ middleware: 'superuser' });

useSeoMeta({
	title: 'User Management | BrightPath Education',
	description:
		'Manage platform users, account access, and administrative permissions in BrightPath Education.'
});

const { data, pending, status, error, refresh } = await useFetch<AppUser[]>('/api/users/');
const users = computed<AppUser[]>(() => data.value ?? []);
const isLoading = computed(() => status.value === 'idle' || pending.value);

const { deactivateUser, activateUser, deleteUser } = useUsers();

async function handleDeactivate(id: number) {
	try {
		await deactivateUser(id);
		await refresh();
		toast.success('User deactivated.');
	} catch {
		toast.error('Failed to deactivate user.');
	}
}

async function handleActivate(id: number) {
	try {
		await activateUser(id);
		await refresh();
		toast.success('User activated. Password reset to newpassword123.');
	} catch {
		toast.error('Failed to activate user.');
	}
}

async function handleDelete(id: number) {
	try {
		await deleteUser(id);
		await refresh();
		toast.success('User removed.');
	} catch {
		toast.error('Failed to remove user.');
	}
}
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="User Management" description="Manage all platform users" />

		<div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
			<LoaderCircle class="size-4 animate-spin" />
			<span>Loading users...</span>
		</div>
		<p v-else-if="error" class="text-sm text-destructive">Failed to load users.</p>
		<UsersDataTable
			v-else
			:users="users"
			@deactivate="handleDeactivate"
			@activate="handleActivate"
			@delete="handleDelete"
		/>
	</section>
</template>
