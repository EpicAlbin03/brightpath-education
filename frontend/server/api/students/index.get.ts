import { defineEventHandler, type H3Event } from 'h3'
import { proxyBackendRequest } from '~/server/utils/backend'

export default defineEventHandler((event: H3Event): Promise<unknown> => {
	return proxyBackendRequest<unknown>(event, '/students/')
})