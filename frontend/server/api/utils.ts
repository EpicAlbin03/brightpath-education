import { createError, getCookie, type H3Event } from 'h3';
import { idParamsSchema } from '~~/shared/schemas';
import type { AppUser } from '~~/shared/types';

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

export async function requireAdminOrSuperuser(event: H3Event): Promise<void> {
	const token = getToken(event);
	const config = useRuntimeConfig();

	let user: AppUser;
	try {
		user = await $fetch<AppUser>(`${config.public.apiBase}/auth/me/`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	} catch {
		throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
	}

	if (user.role !== 'admin' && user.role !== 'superuser') {
		throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
	}
}
