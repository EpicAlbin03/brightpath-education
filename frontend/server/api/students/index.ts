import { Student } from '~~/shared/types';
import { getToken } from '../utils';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const students = await $fetch<Student[]>(`${config.public.apiBase}/students/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return students;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		return sendError(event, createError({ statusCode: 500, message: 'Failed to fetch students.' }));
	}
});
