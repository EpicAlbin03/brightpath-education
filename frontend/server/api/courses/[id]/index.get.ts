import { Course } from '~~/shared/types';
import { getToken, validateIdParams } from '../../utils';
import { z } from 'zod';

const querySchema = z.object({
	include: z.enum(['students']).optional()
});

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const query = await getValidatedQuery(event, querySchema.safeParse);

	if (!query.success) {
		throw createError({ statusCode: 422, message: 'Invalid query parameters' });
	}
	const queryString = query.data.include ? `?include=${query.data.include}` : '';

	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const course = await $fetch<Course>(`${config.public.apiBase}/courses/${id}/${queryString}`, {
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
