import { Course } from '~~/shared/types';
import { getToken, validateIdParams } from '../../utils';

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const course = await $fetch<Course>(`${config.public.apiBase}/courses/${id}/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return course;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: `Failed to fetch course ${id}` });
	}
});
