import { createError, getCookie, type H3Event } from 'h3'

type BackendError = {
	statusCode?: number;
	statusMessage?: string;
	data?: {
		detail?: string;
	} | string;
};

export async function proxyBackendRequest<T>(
	event: H3Event,
	path: string,
	options: Record<string, unknown> = {}
) {
	const config = useRuntimeConfig();
	const accessToken = getCookie(event, 'access_token');

	if (!accessToken) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized'
		});
	}

	const apiBase = String(config.public.apiBase ?? '').replace(/\/$/, '');

	try {
		return await $fetch<T>(`${apiBase}${path}`, {
			...options,
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${accessToken}`,
				...(options.headers as Record<string, string> | undefined)
			}
		});
	} catch (error) {
		const backendError = error as BackendError;
		const detail =
			typeof backendError.data === 'string'
				? backendError.data
				: backendError.data?.detail;

		throw createError({
			statusCode: backendError.statusCode ?? 502,
			statusMessage: detail ?? backendError.statusMessage ?? 'Backend request failed.'
		});
	}
}