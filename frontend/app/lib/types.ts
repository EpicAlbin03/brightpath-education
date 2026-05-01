export type Course = {
	id: number;
	name: string;
	code: string;
	description: string;
	student_count: number;
	student_ids?: number[];
	students?: Student[];
};

export type Student = {
	id: number;
	name: string;
	profile_photo?: string;
	email: string;
	date_of_birth: string | null;
	grade: string;
	is_active: boolean;
	course_count: number;
	course_ids?: number[];
	courses?: Course[];
};
