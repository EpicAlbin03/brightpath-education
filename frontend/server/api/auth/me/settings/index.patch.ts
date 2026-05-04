import { userSettingsPatchSchema } from '~~/shared/schemas';
import type { AppUserSettings } from '~~/shared/types';
import { getToken } from '../../../utils';

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, userSettingsPatchSchema.safeParse);

	if (!body.success) {
		throw createError({ statusCode: 422, message: 'Invalid settings data.' });
	}

	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		return await $fetch<AppUserSettings>(`${config.public.apiBase}/auth/me/settings/`, {
			method: 'PATCH',
			body: body.data,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: 'Failed to update user settings.' });
	}
});
