export default defineEventHandler((event) => {
	console.log('POST /api/courses/delete');
	setResponseStatus(event, 200);

	return {
		ok: true,
		route: 'POST /api/courses/delete'
	};
});
