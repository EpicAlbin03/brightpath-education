import type { Course, Student } from './types';

export const courses: Course[] = [
	{
		id: 1,
		name: 'Introduction to Mathematics',
		code: 'MATH101',
		description: 'Builds confidence with algebra, arithmetic, and problem-solving fundamentals.'
	},
	{
		id: 2,
		name: 'Foundations of English Literature',
		code: 'ENG201',
		description: 'Explores poetry, prose, and critical reading through modern and classic texts.'
	},
	{
		id: 3,
		name: 'General Science',
		code: 'SCI110',
		description:
			'Introduces scientific thinking across biology, chemistry, and physics topics through lab reflections, collaborative experiments, data interpretation exercises, and real-world case studies that stretch across the full term.'
	},
	{
		id: 4,
		name: 'World History',
		code: 'HIST205',
		description: 'Covers major global events, timelines, and cultural movements.'
	},
	{
		id: 5,
		name: 'Computer Skills for Beginners',
		code: 'COMP120',
		description: 'Focuses on digital literacy, typing, productivity tools, and online safety.'
	}
];

export const students: Student[] = [
	{
		id: 1,
		name: 'Ava Thompson',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'ava.thompson@example.com',
		date_of_birth: '2008-03-14',
		grade: 'A',
		is_active: true,
		course_ids: [1, 3]
	},
	{
		id: 2,
		name: 'Noah Bennett',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'noah.bennett@example.com',
		date_of_birth: '2007-11-02',
		grade: 'B+',
		is_active: true,
		course_ids: [1]
	},
	{
		id: 3,
		name: 'Mia Patel',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'mia.patel@example.com',
		date_of_birth: '2008-07-21',
		grade: 'A-',
		is_active: true,
		course_ids: [2, 4]
	},
	{
		id: 4,
		name: 'Liam Carter',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'liam.carter@example.com',
		date_of_birth: '2006-12-09',
		grade: 'C+',
		is_active: false,
		course_ids: [2]
	},
	{
		id: 5,
		name: 'Sophia Nguyen',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'sophia.nguyen@example.com',
		date_of_birth: '2007-05-30',
		grade: 'B',
		is_active: true,
		course_ids: [3, 5]
	},
	{
		id: 6,
		name: 'Ethan Walker',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'ethan.walker@example.com',
		date_of_birth: null,
		grade: 'NA',
		is_active: true,
		course_ids: [3]
	},
	{
		id: 7,
		name: 'Isabella Green',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'isabella.green@example.com',
		date_of_birth: '2008-01-17',
		grade: 'A',
		is_active: true,
		course_ids: [4, 5]
	},
	{
		id: 8,
		name: 'James Flores',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'james.flores@example.com',
		date_of_birth: '2007-09-08',
		grade: 'B-',
		is_active: false,
		course_ids: [4]
	},
	{
		id: 9,
		name: 'Charlotte Adams',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'charlotte.adams@example.com',
		date_of_birth: '2006-04-26',
		grade: 'A+',
		is_active: true,
		course_ids: [5, 1]
	},
	{
		id: 10,
		name: 'Benjamin Scott',
		profile_photo: 'https://github.com/shadcn.png',
		email: 'benjamin.scott@example.com',
		date_of_birth: '2008-08-13',
		grade: 'B',
		is_active: true,
		course_ids: [5, 2]
	}
];
