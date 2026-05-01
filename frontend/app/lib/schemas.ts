import { z } from 'zod';
import type { Course, Student } from './types';

export type CourseFormPayload = Omit<Course, 'id' | 'students'>;
export type StudentFormPayload = Omit<Student, 'id' | 'is_active' | 'profile_photo' | 'courses'>;

export const studentGradeOptions = [
	'A+',
	'A',
	'A-',
	'B+',
	'B',
	'B-',
	'C+',
	'C',
	'C-',
	'D+',
	'D',
	'F',
	'NA'
] as const;

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
		.max(16, 'Course code must be 16 characters or fewer.'),
	description: z
		.string()
		.trim()
		.min(10, 'Description must be at least 10 characters.')
		.max(500, 'Description must be 500 characters or fewer.'),
	student_ids: z.array(z.number().int()).default([])
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
	course_ids: z.array(z.number().int()).default([])
});

export type CourseFormSchema = z.infer<typeof courseFormSchema>;
export type StudentFormSchema = z.infer<typeof studentFormSchema>;
