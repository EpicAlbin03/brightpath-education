import { Student } from '~~/shared/types';
import { getToken, validateIdParams } from '../../utils';

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const student = await $fetch<Student>(`${config.public.apiBase}/students/${id}/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return student;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		return sendError(
			event,
			createError({ statusCode: 500, message: `Failed to fetch student ${id}` })
		);
	}
});
