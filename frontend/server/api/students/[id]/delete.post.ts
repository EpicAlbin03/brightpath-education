import { getToken, validateIdParams } from '../../utils';

export default defineEventHandler(async (event) => {
	const id = await validateIdParams(event);
	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		await $fetch(`${config.public.apiBase}/students/${id}/`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		return sendError(
			event,
			createError({ statusCode: 500, message: `Failed to delete student ${id}` })
		);
	}
});
