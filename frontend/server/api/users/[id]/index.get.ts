import type { AppUser } from '~~/shared/types';
import { getToken, validateIdParams } from '../../utils';

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const user = await $fetch<AppUser>(`${config.public.apiBase}/users/${id}/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return user;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: `Failed to fetch user ${id}.` });
	}
});
