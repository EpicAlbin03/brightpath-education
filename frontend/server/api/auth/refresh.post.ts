export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const config = useRuntimeConfig();

	try {
		const data = await $fetch<{ access: string }>(`${config.public.apiBase}/auth/refresh/`, {
			method: 'POST',
			body,
			headers: { Accept: 'application/json' }
		});
		return data;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 401, message: 'Token refresh failed' });
	}
});
