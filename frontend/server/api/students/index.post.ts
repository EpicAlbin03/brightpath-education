import { defineEventHandler, readBody } from 'h3'
import { proxyBackendRequest } from '~/server/utils/backend'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	return proxyBackendRequest(event, '/students/', {
		method: 'POST',
		body
	})
})