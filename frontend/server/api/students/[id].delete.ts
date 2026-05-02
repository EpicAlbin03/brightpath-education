import { createError, defineEventHandler, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~/server/utils/backend'

export default defineEventHandler((event) => {
	const studentId = getRouterParam(event, 'id')

	if (!studentId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Student id is required.'
		})
	}

	return proxyBackendRequest(event, `/students/${studentId}/`, {
		method: 'DELETE'
	})
})