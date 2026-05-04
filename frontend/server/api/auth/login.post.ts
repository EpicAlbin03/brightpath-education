export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const config = useRuntimeConfig();

	try {
		const data = await $fetch<{ access: string; refresh: string }>(`${config.public.apiBase}/auth/login/`, {
			method: 'POST',
			body,
			headers: { Accept: 'application/json' }
		});

		setCookie(event, 'refresh_token', data.refresh, {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 30
		});

		return { access: data.access };
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 401, message: 'Invalid credentials' });
	}
});
