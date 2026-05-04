import type { AppUserSettings } from '~~/shared/types';
import { getToken } from '../../../utils';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		return await $fetch<AppUserSettings>(`${config.public.apiBase}/auth/me/settings/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: 'Failed to fetch user settings.' });
	}
});
