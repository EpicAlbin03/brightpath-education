<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ref } from 'vue';
import { Field as VeeField, useForm } from 'vee-validate';
import { courseFormSchema, type CourseFormSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const emit = defineEmits<{
	created: [payload: CourseFormSchema];
}>();

const submitError = ref<string | null>(null);
const submitSuccess = ref<string | null>(null);

const initialValues: CourseFormSchema = {
	name: '',
	code: '',
	description: ''
};

const { handleSubmit, isSubmitting, resetForm } = useForm({
	validationSchema: toTypedSchema(courseFormSchema),
	initialValues: {
		name: '',
		code: '',
		description: ''
	}
});

const onSubmit = handleSubmit(async (values) => {
	submitError.value = null;
	submitSuccess.value = null;

	try {
		await $fetch('/api/courses/create', {
			method: 'POST',
			body: values
		});

		emit('created', values);
		resetForm({ values: initialValues });
		submitSuccess.value = 'Course created successfully.';
	} catch (error) {
		submitError.value =
			error instanceof Error ? error.message : 'Unable to create course right now.';
	}
});
</script>

<template>
	<form class="max-w-lg space-y-6" novalidate @submit="onSubmit">
		<FieldSet class="gap-5">
			<VeeField v-slot="{ field, errors }" name="name" :validate-on-input="true">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="course-name">Course name</FieldLabel>
					<Input
						id="course-name"
						v-bind="field"
						placeholder="Introduction to Mathematics"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="code" :validate-on-input="true">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="course-code">Course code</FieldLabel>
					<Input
						id="course-code"
						v-bind="field"
						placeholder="MATH101"
						autocomplete="off"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="description" :validate-on-input="true">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="course-description">Description</FieldLabel>
					<textarea
						id="course-description"
						v-bind="field"
						rows="5"
						placeholder="Summarize what this course covers and who it is for."
						class="block min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>
		</FieldSet>

		<p v-if="submitError" class="text-sm text-destructive">
			{{ submitError }}
		</p>
		<p v-else-if="submitSuccess" class="text-sm text-emerald-600">
			{{ submitSuccess }}
		</p>

		<div class="flex items-center gap-3">
			<Button type="submit" :disabled="isSubmitting">
				{{ isSubmitting ? 'Creating course...' : 'Create course' }}
			</Button>
			<Button
				type="button"
				variant="outline"
				:disabled="isSubmitting"
				@click="resetForm({ values: initialValues })"
			>
				Reset
			</Button>
		</div>
	</form>
</template>
