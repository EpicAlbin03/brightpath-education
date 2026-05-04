export default defineEventHandler(async (event) => {
	const token = getCookie(event, 'access_token');
	const config = useRuntimeConfig();

	if (!token) {
		throw createError({ statusCode: 401, message: 'Unauthorized' });
	}

	try {
		const data = await $fetch(`${config.public.apiBase}/auth/me/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});
		return data;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 401, message: 'Unauthorized' });
	}
});
