export default defineEventHandler(async (event) => {
	const refresh = getCookie(event, 'refresh_token');
	if (!refresh) {
		throw createError({ statusCode: 401, message: 'No refresh token' });
	}

	const config = useRuntimeConfig();

	try {
		const data = await $fetch<{ access: string }>(`${config.public.apiBase}/auth/refresh/`, {
			method: 'POST',
			body: { refresh },
			headers: { Accept: 'application/json' }
		});
		return data;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 401, message: 'Token refresh failed' });
	}
});
