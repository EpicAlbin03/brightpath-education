import { createError, defineEventHandler, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~/server/utils/backend'

export default defineEventHandler((event) => {
	const studentId = getRouterParam(event, 'studentId')
	const courseId = getRouterParam(event, 'courseId')

	if (!studentId || !courseId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Student id and course id are required.'
		})
	}

	return proxyBackendRequest(event, `/students/${studentId}/courses/${courseId}/`, {
		method: 'DELETE'
	})
})