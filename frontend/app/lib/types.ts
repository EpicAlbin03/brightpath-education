export type Course = {
  id: number;
  name: string;
  code: string;
  description: string;
};

export type Student = {
  id: number;
  name: string;
  email: string;
  date_of_birth: string | null;
  grade: string;
  is_active: boolean;
  course: number;
};