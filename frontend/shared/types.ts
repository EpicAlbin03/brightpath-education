export type Course = {
	id: number;
	name: string;
	code: string;
	description: string;
	student_count: number;
};

export type CourseIncludeStudents = Course & {
	students: Student[];
};

export type Student = {
	id: number;
	name: string;
	email: string;
	date_of_birth: string | null;
	grade: string;
	is_active: boolean;
	course_count: number;
};

export type StudentIncludeCourses = Student & {
	courses: Course[];
};

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
	'N/A'
] as const;

export type StudentGrade = (typeof studentGradeOptions)[number];

export type AppUser = {
	id: number;
	username: string;
	email: string;
	role: 'viewer' | 'admin' | 'superuser';
	is_active: boolean;
	date_joined: string;
};

export type AppUserSettings = {
	cookie_consent: boolean | null;
};

export const userRoleOptions = ['viewer', 'admin', 'superuser'] as const;
export type UserRole = (typeof userRoleOptions)[number];
