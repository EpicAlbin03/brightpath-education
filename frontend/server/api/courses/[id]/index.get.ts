export default defineEventHandler((event) => {
	const id = getRouterParam(event, 'id');

	console.log(`GET /api/courses/${id}`);
	setResponseStatus(event, 200);

	return {
		ok: true,
		id,
		route: `GET /api/courses/${id}`
	};
});
