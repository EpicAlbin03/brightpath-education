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
