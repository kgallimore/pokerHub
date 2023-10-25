import prisma from '$lib/prisma';
import { type Handle, error } from '@sveltejs/kit';

prisma.sensors.deleteMany({}).then(() => {
	prisma.commPorts.deleteMany({}).then(() => {
		console.log('Deleted all sensors');
	});
});
export const handle: Handle = async ({ resolve, event }) => {
	// Apply CORS header for API routes
	if (event.url.pathname.startsWith('/api')) {
		// Required for CORS to work
		if (event.request.method === 'POST') {
			const apiKey = event.request.headers.get('x-api-key');
			if (apiKey == null)
				throw error(401, {
					message: 'Missing API Key'
				});
			const dbKey = await prisma.apiKeys.findFirst({ where: { value: apiKey } });
			if (dbKey == null)
				throw error(401, {
					message: 'Invalid API Key'
				});
		} else if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}
	}
	const response = await resolve(event);
	if (event.url.pathname.startsWith('/api')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}
	return response;
};
