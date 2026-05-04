<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { toTypedSchema } from '@vee-validate/zod';
import { CalendarIcon } from 'lucide-vue-next';
import type { DateValue } from 'reka-ui';
import { computed, ref } from 'vue';
import { Field as VeeField, useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import { studentFormSchema, type StudentFormSchema } from '~~/shared/schemas';
import { studentGradeOptions } from '~~/shared/types';
import type { Course, StudentIncludeCourses } from '~~/shared/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const props = defineProps<{
	student: StudentIncludeCourses;
	courses: Course[];
}>();

const emit = defineEmits<{
	updated: [payload: StudentFormSchema];
}>();

const config = useRuntimeConfig();
const isDatePickerOpen = ref(false);
const localTimeZone = getLocalTimeZone();
const dateFormatter = new DateFormatter('en-US', { dateStyle: 'long' });
const defaultDatePlaceholder = today(localTimeZone);

const initialValues = computed<StudentFormSchema>(() => ({
	name: props.student.name,
	email: props.student.email,
	date_of_birth: props.student.date_of_birth ?? '',
	grade: props.student.grade as StudentFormSchema['grade'],
	course_ids: props.student.courses.map((course) => course.id)
}));

const parseStudentDate = (value: string) => {
	if (!value) {
		return undefined;
	}

	try {
		return parseDate(value);
	} catch {
		return undefined;
	}
};

const formatStudentDate = (value: string) => {
	const parsedValue = parseStudentDate(value);

	return parsedValue ? dateFormatter.format(parsedValue.toDate(localTimeZone)) : 'Pick a date';
};

const updateStudentDate = (value: DateValue | undefined, onChange: (value: string) => void) => {
	onChange(value ? value.toString() : '');

	if (value) {
		isDatePickerOpen.value = false;
	}
};

const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
	validationSchema: toTypedSchema(studentFormSchema),
	initialValues: initialValues.value,
	validateOnMount: true
});

const router = useRouter();

const onSubmit = handleSubmit(async (values) => {
	const accessToken = localStorage.getItem('access_token');

	try {
		await $fetch(`${config.public.apiBase}/students/${props.student.id}/`, {
			method: 'PUT',
			body: values,
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		emit('updated', values);
		resetForm({ values });
		toast.success('Student updated successfully.');
		await router.push('/students');
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		toast.error('Failed to update student. Please try again later.');
	}
});
</script>

<template>
	<form class="max-w-lg space-y-6" novalidate @submit="onSubmit">
		<FieldSet class="gap-5">
			<VeeField v-slot="{ field, errors }" name="name" :validate-on-input="true">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="student-name">Student name</FieldLabel>
					<Input
						id="student-name"
						v-bind="field"
						:default-value="initialValues.name"
						placeholder="Ava Thompson"
						autocomplete="name"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="email" :validate-on-input="true">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="student-email">Email</FieldLabel>
					<Input
						id="student-email"
						v-bind="field"
						:default-value="initialValues.email"
						type="email"
						placeholder="ava.thompson@example.com"
						autocomplete="email"
						:aria-invalid="!!errors.length"
					/>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="date_of_birth">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="student-date-of-birth">Date of birth</FieldLabel>
					<Popover :open="isDatePickerOpen" @update:open="(value) => (isDatePickerOpen = value)">
						<PopoverTrigger as-child>
							<Button
								id="student-date-of-birth"
								type="button"
								variant="outline"
								:class="
									cn(
										'w-full justify-start text-left font-normal',
										!field.value && 'text-muted-foreground'
									)
								"
								:aria-invalid="!!errors.length"
								@blur="field.onBlur"
							>
								<CalendarIcon class="mr-2 size-4" />
								{{ formatStudentDate(field.value) }}
							</Button>
						</PopoverTrigger>
						<PopoverContent class="w-auto p-0" align="start">
							<Calendar
								:model-value="parseStudentDate(field.value)"
								:default-placeholder="defaultDatePlaceholder"
								:initial-focus="true"
								layout="month-and-year"
								@update:model-value="(value) => updateStudentDate(value, field.onChange)"
							/>
						</PopoverContent>
					</Popover>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="grade">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="student-grade">Grade</FieldLabel>
					<Select
						:model-value="field.value"
						@update:model-value="field.onChange"
						@blur="field.onBlur"
					>
						<SelectTrigger id="student-grade" class="w-full" :aria-invalid="!!errors.length">
							<SelectValue :value="initialValues.grade" placeholder="Select a grade" />
						</SelectTrigger>
						<SelectContent position="item-aligned">
							<SelectItem v-for="grade in studentGradeOptions" :key="grade" :value="grade">
								{{ grade }}
							</SelectItem>
						</SelectContent>
					</Select>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>

			<VeeField v-slot="{ field, errors }" name="course_ids">
				<Field :data-invalid="!!errors.length">
					<FieldLabel for="student-courses">Courses</FieldLabel>
					<Select
						id="student-courses"
						multiple
						:model-value="(field.value ?? []).map(String)"
						:disabled="!props.courses.length"
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
								:placeholder="props.courses.length ? 'Select courses' : 'No courses available'"
							>
								<span v-if="field.value?.length">{{ field.value.length }} selected</span>
							</SelectValue>
						</SelectTrigger>
						<SelectContent position="item-aligned">
							<SelectItem
								v-for="course in props.courses"
								:key="course.id"
								:value="String(course.id)"
							>
								{{ course.name }}
							</SelectItem>
						</SelectContent>
					</Select>
					<FieldError v-if="errors.length" :errors="errors" />
				</Field>
			</VeeField>
		</FieldSet>

		<div class="flex items-center gap-3">
			<Button type="submit" :disabled="isSubmitting || !meta.dirty || !meta.valid">
				{{ isSubmitting ? 'Updating student...' : 'Update student' }}
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
