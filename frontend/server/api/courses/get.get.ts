export default defineEventHandler((event) => {
	console.log('GET /api/courses/get');
	setResponseStatus(event, 200);

	return {
		ok: true,
		route: 'GET /api/courses/get'
	};
});
