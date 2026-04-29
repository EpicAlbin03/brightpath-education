import type { Course, Student } from "./types";

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
    description: 'Introduces scientific thinking across biology, chemistry, and physics topics.'
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
    email: 'ava.thompson@example.com',
    date_of_birth: '2008-03-14',
    grade: 'A',
    is_active: true,
    course: 1
  },
  {
    id: 2,
    name: 'Noah Bennett',
    email: 'noah.bennett@example.com',
    date_of_birth: '2007-11-02',
    grade: 'B+',
    is_active: true,
    course: 1
  },
  {
    id: 3,
    name: 'Mia Patel',
    email: 'mia.patel@example.com',
    date_of_birth: '2008-07-21',
    grade: 'A-',
    is_active: true,
    course: 2
  },
  {
    id: 4,
    name: 'Liam Carter',
    email: 'liam.carter@example.com',
    date_of_birth: '2006-12-09',
    grade: 'C+',
    is_active: false,
    course: 2
  },
  {
    id: 5,
    name: 'Sophia Nguyen',
    email: 'sophia.nguyen@example.com',
    date_of_birth: '2007-05-30',
    grade: 'B',
    is_active: true,
    course: 3
  },
  {
    id: 6,
    name: 'Ethan Walker',
    email: 'ethan.walker@example.com',
    date_of_birth: null,
    grade: 'NA',
    is_active: true,
    course: 3
  },
  {
    id: 7,
    name: 'Isabella Green',
    email: 'isabella.green@example.com',
    date_of_birth: '2008-01-17',
    grade: 'A',
    is_active: true,
    course: 4
  },
  {
    id: 8,
    name: 'James Flores',
    email: 'james.flores@example.com',
    date_of_birth: '2007-09-08',
    grade: 'B-',
    is_active: false,
    course: 4
  },
  {
    id: 9,
    name: 'Charlotte Adams',
    email: 'charlotte.adams@example.com',
    date_of_birth: '2006-04-26',
    grade: 'A+',
    is_active: true,
    course: 5
  },
  {
    id: 10,
    name: 'Benjamin Scott',
    email: 'benjamin.scott@example.com',
    date_of_birth: '2008-08-13',
    grade: 'B',
    is_active: true,
    course: 5
  }
];
