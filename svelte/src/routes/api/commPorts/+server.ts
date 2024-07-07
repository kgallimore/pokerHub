import prisma from '$lib/prisma';
import { error, json } from '@sveltejs/kit';
import type { CommPortUpdate } from '$lib/comm';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const state = await prisma.commPorts.findMany({
		include: { sensors: { include: { card: true } } }
	});
	return json({ state });
};

export const POST = (async ({ request }) => {
	console.log('Comm port update posted');
	const newData = (await request.json()) as CommPortUpdate;
	console.table(newData);
	// Create an array with the number of sensors in the comm port
	const currentComm = await prisma.commPorts.findFirst({ where: { commPort: newData.commPort } });
	if (!currentComm && !newData.connected)
		throw error(400, { message: "Can't create disconnected port" });
	const c = Array.from(Array(newData.numberOfSensors ?? 1).keys()).map((i) => ({ sensorId: i }));
	await prisma.commPorts.upsert({
		where: { commPort: newData.commPort },
		create: { commPort: newData.commPort, connected: newData.connected, sensors: { create: c } },
		update: { connected: newData.connected }
	});
	return new Response('Ok');
}) satisfies RequestHandler;
