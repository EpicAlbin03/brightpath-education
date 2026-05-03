<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field as VeeField, useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import { userEditSchema, type UserEditSchema } from '~~/shared/schemas';
import { userRoleOptions } from '~~/shared/types';
import type { AppUser } from '~~/shared/types';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

const props = defineProps<{
	user: AppUser;
}>();

const emit = defineEmits<{
	updated: [user: AppUser];
}>();

const { updateUser } = useUsers();

const initialValues = computed<UserEditSchema>(() => ({
	username: props.user.username,
	role: props.user.role === 'superuser' ? 'superuser' : (props.user.role as UserEditSchema['role'])
}));

const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
	validationSchema: toTypedSchema(userEditSchema),
	initialValues: initialValues.value,
	validateOnMount: true
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const updated = await updateUser(props.user.id, values);
		emit('updated', updated);
		resetForm({ values });
		toast.success('User updated successfully.');
	} catch {
		toast.error('Failed to update user. Please try again.');
	}
});
</script>

<template>
	<form class="max-w-lg space-y-6" novalidate @submit="onSubmit">
		<FieldSet class="gap-5">
			<!-- Email (read-only) -->
			<Field>
				<FieldLabel for="user-email">Email</FieldLabel>
				<Input
					id="user-email"
					:model-value="user.email"
					type="email"
					disabled
					class="cursor-not-allowed opacity-60"
				/>
			</Field>

			<!-- Username -->
			<VeeField v-slot="{ field, errors }" name="username" :validate-on-input="true">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="user-username">Username</FieldLabel>
					<Input
						id="user-username"
						v-bind="field"
						:default-value="initialValues.username"
						placeholder="username"
						autocomplete="username"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<!-- Role -->
			<VeeField v-slot="{ field, errors, handleChange }" name="role">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="user-role">Role</FieldLabel>
					<Select
						:model-value="field.value"
						@update:model-value="handleChange"
					>
						<SelectTrigger id="user-role" :aria-invalid="!!errors.length">
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem v-for="role in userRoleOptions" :key="role" :value="role">
								{{ role }}
							</SelectItem>
						</SelectContent>
					</Select>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>
		</FieldSet>

		<div class="flex gap-3">
			<Button type="submit" :disabled="isSubmitting || !meta.dirty || !meta.valid">
				<span v-if="isSubmitting">Saving...</span>
				<span v-else>Save changes</span>
			</Button>
			<Button type="button" variant="outline" @click="navigateTo('/users')">
				Cancel
			</Button>
		</div>
	</form>
</template>
