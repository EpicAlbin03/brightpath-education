export default defineEventHandler((event) => {
	console.log('GET /api/courses');
	setResponseStatus(event, 200);

	return {
		ok: true,
		route: 'GET /api/courses'
	};
});
