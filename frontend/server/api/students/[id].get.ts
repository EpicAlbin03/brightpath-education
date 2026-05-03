import { createError, defineEventHandler, getQuery, getRouterParam, type H3Event } from 'h3'
import { proxyBackendRequest } from '~/server/utils/backend'

function toQueryString(query: Record<string, unknown>) {
	const params = new URLSearchParams()

	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === null || value === '') {
			continue
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				params.append(key, String(item))
			}
			continue
		}

		params.set(key, String(value))
	}

	const queryString = params.toString()
	return queryString ? `?${queryString}` : ''
}

export default defineEventHandler((event: H3Event): Promise<unknown> => {
	const studentId = getRouterParam(event, 'id')

	if (!studentId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Student id is required.'
		})
	}

	return proxyBackendRequest<unknown>(event, `/students/${studentId}/${toQueryString(getQuery(event))}`)
})