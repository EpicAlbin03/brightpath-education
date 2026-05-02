<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field as VeeField, useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import { courseFormSchema, type CourseFormSchema } from '~~/shared/schemas';
import type { Student } from '~~/shared/types';
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
import { Textarea } from '@/components/ui/textarea';

const props = defineProps<{
	students: Student[];
}>();

const emit = defineEmits<{
	created: [payload: CourseFormSchema];
}>();

const initialValues: CourseFormSchema = {
	name: '',
	code: '',
	description: '',
	student_ids: []
};

const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
	validationSchema: toTypedSchema(courseFormSchema),
	initialValues
});

const onSubmit = handleSubmit(async (values) => {
	try {
		await $fetch('/api/courses/', {
			method: 'POST',
			body: values
		});

		emit('created', values);
		resetForm({ values: initialValues });
		toast.success('Course created successfully.');
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		toast.error('Failed to create course. Please try again later.');
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
					<Textarea
						id="course-description"
						v-bind="field"
						placeholder="Summarize what this course covers and who it is for."
						class="min-h-28"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="student_ids">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="course-students">Students</FieldLabel>
					<Select
						id="course-students"
						multiple
						:model-value="(field.value ?? []).map(String)"
						:disabled="!props.students.length"
						@update:model-value="
							(value) =>
								field.onChange(
									Array.isArray(value)
										? value.map((item: string | number) => Number(item))
										: value
											? [Number(value)]
											: []
								)
						"
						@blur="field.onBlur"
					>
						<SelectTrigger class="w-full" :aria-invalid="!!errors.length">
							<SelectValue
								:placeholder="props.students.length ? 'Select students' : 'No students available'"
							>
								<span v-if="field.value?.length">{{ field.value.length }} selected</span>
							</SelectValue>
						</SelectTrigger>
						<SelectContent position="item-aligned">
							<SelectItem
								v-for="student in props.students"
								:key="student.id"
								:value="String(student.id)"
							>
								{{ student.name }}
							</SelectItem>
						</SelectContent>
					</Select>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>
		</FieldSet>

		<div class="flex items-center gap-3">
			<Button type="submit" :disabled="isSubmitting || !meta.dirty || !meta.valid">
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
