export default defineEventHandler((event) => {
	const id = getRouterParam(event, 'id');

	console.log(`POST /api/courses/${id}/delete`);
	setResponseStatus(event, 200);

	return {
		ok: true,
		id,
		route: `POST /api/courses/${id}/delete`
	};
});
