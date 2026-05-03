import { z } from 'zod';
import { studentGradeOptions } from './types';

export const idParamsSchema = z.object({
	id: z.coerce.number().int()
});

export type IdParams = z.infer<typeof idParamsSchema>;

export const courseFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Course name must be at least 2 characters.')
		.max(100, 'Course name must be 100 characters or fewer.'),
	code: z
		.string()
		.trim()
		.min(3, 'Course code must be at least 3 characters.')
		.max(10, 'Course code must be 10 characters or fewer.'),
	description: z.string().trim().max(255, 'Description must be 255 characters or fewer.'),
	student_ids: z.array(z.coerce.number().int()).default([])
});

export const studentFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Student name must be at least 2 characters.')
		.max(80, 'Student name must be 80 characters or fewer.'),
	email: z.string().trim().email('Enter a valid email address.'),
	date_of_birth: z.string().trim(),
	grade: z.enum(studentGradeOptions),
	course_ids: z.array(z.coerce.number().int()).default([])
});

export type CourseFormSchema = z.infer<typeof courseFormSchema>;
export type StudentFormSchema = z.infer<typeof studentFormSchema>;
