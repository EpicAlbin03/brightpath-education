import { Course } from '~~/shared/types';
import { getToken } from '../utils';
import { courseFormSchema } from '~~/shared/schemas';

export default defineEventHandler(async (event) => {
	const formData = await readValidatedBody(event, courseFormSchema.safeParse);

	if (!formData.success) {
		throw createError({ statusCode: 422, message: 'Invalid form data' });
	}

	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const student = await $fetch<Course>(`${config.public.apiBase}/students/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return student;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: 'Failed to create student' });
	}
});
