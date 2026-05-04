export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const config = useRuntimeConfig();

	try {
		const data = await $fetch(`${config.public.apiBase}/auth/register/`, {
			method: 'POST',
			body,
			headers: { Accept: 'application/json' }
		});
		return data;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 400, message: 'Registration failed' });
	}
});
