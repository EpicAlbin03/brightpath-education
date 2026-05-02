import { Course } from '~~/shared/types';
import { getToken } from '../utils';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const courses = await $fetch<Course[]>(`${config.public.apiBase}/courses/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return courses;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: 'Failed to fetch courses.' });
	}
});
