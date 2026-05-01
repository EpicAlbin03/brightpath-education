export type Course = {
	id: number;
	name: string;
	code: string;
	description: string;
	studentCount: number;
};

export type Student = {
	id: number;
	name: string;
	profile_photo?: string;
	email: string;
	date_of_birth: string | null;
	grade: string;
	is_active: boolean;
	courseCount: number;
};
