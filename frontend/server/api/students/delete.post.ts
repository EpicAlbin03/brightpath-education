export default defineEventHandler((event) => {
	console.log('POST /api/students/delete');
	setResponseStatus(event, 200);

	return {
		ok: true,
		route: 'POST /api/students/delete'
	};
});
