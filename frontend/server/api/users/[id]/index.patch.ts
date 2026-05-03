import type { AppUser } from '~~/shared/types';
import { userEditSchema } from '~~/shared/schemas';
import { getToken, validateIdParams } from '../../utils';

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const body = await readValidatedBody(event, userEditSchema.safeParse);

	if (!body.success) {
		throw createError({ statusCode: 422, message: 'Invalid form data.' });
	}

	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const user = await $fetch<AppUser>(`${config.public.apiBase}/users/${id}/`, {
			method: 'PATCH',
			body: body.data,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return user;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: `Failed to update user ${id}.` });
	}
});
