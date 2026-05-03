import { createError, getCookie, type H3Event } from 'h3';
import { idParamsSchema } from '~~/shared/schemas';

export function getToken(event: H3Event): string {
	const token = getCookie(event, 'access_token');

	if (!token) {
		throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
	}

	return token;
}

export async function validateIdParams(event: H3Event): Promise<number> {
	const paramResult = await getValidatedRouterParams(event, idParamsSchema.safeParse);

	if (!paramResult.success) {
		throw createError({ statusCode: 422, statusMessage: 'Invalid id' });
	}

	return paramResult.data.id;
}
