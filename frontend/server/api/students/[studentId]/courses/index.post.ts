import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { proxyBackendRequest } from '~/server/utils/backend'

export default defineEventHandler(async (event) => {
	const studentId = getRouterParam(event, 'studentId')

	if (!studentId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Student id is required.'
		})
	}

	const body = await readBody(event)

	return proxyBackendRequest(event, `/students/${studentId}/courses/`, {
		method: 'POST',
		body
	})
})