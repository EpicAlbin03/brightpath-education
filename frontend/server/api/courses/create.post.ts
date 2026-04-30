export default defineEventHandler((event) => {
	console.log('POST /api/courses/create');
	setResponseStatus(event, 200);

	return {
		ok: true,
		route: 'POST /api/courses/create'
	};
});
