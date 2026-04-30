export default defineEventHandler((event) => {
	const id = getRouterParam(event, 'id');

	console.log(`POST /api/students/${id}/edit`);
	setResponseStatus(event, 200);

	return {
		ok: true,
		id,
		route: `POST /api/students/${id}/edit`
	};
});
