<script setup lang="ts">
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';

const props = defineProps<{
	open: boolean;
	title: string;
	description: string;
	action: () => Promise<unknown> | unknown;
}>();

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

async function handleDelete() {
	await props.action();
	emit('update:open', false);
}
</script>

<template>
	<AlertDialog :open="open" @update:open="emit('update:open', $event)">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{{ title }}</AlertDialogTitle>
				<AlertDialogDescription>{{ description }}</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction
					:class="buttonVariants({ variant: 'destructive' })"
					@click.prevent="handleDelete"
				>
					Delete
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>
