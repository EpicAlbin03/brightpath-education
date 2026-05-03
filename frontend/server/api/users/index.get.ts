import type { AppUser } from '~~/shared/types';
import { getToken } from '../utils';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const users = await $fetch<AppUser[]>(`${config.public.apiBase}/users/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return users;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: 'Failed to fetch users.' });
	}
});
