import { Student } from '~~/shared/types';
import { getToken, validateIdParams } from '../../../utils';

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const students = await $fetch<Student[]>(`${config.public.apiBase}/courses/${id}/students/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return students;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({
			statusCode: 500,
			message: `Failed to fetch students enrolled in course ${id}`
		});
	}
});
