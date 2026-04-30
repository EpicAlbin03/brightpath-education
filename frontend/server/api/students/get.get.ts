export default defineEventHandler((event) => {
	console.log('GET /api/students/get');
	setResponseStatus(event, 200);

	return {
		ok: true,
		route: 'GET /api/students/get'
	};
});
