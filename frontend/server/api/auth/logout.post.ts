export default defineEventHandler((event) => {
	deleteCookie(event, 'access_token', { path: '/' });
	deleteCookie(event, 'refresh_token', { path: '/' });
	return { ok: true };
});
