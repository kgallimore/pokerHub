import prisma from '$lib/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import type { SensorUpdate } from '$lib/comm';

export const GET: RequestHandler = async () => {
	const state = await prisma.commPorts.findMany({
		include: { sensors: { include: { card: true } } }
	});
	return json({ state });
};
export const POST = (async ({ request }) => {
	const newData = (await request.json()) as SensorUpdate;
	const currentSensor = await prisma.sensors.findFirst({
		where: { commPort: { commPort: newData.commPort }, sensorId: newData.sensor },
		include: { card: true }
	});
	if (currentSensor?.card?.uid === newData.value) return new Response('Ok');
	const targetCommPort = await prisma.commPorts.findFirst({
		where: { commPort: newData.commPort },
		select: { id: true }
	});
	const targetCard = await prisma.card.findFirst({
		where: { uid: newData.value },
		select: { id: true }
	});
	if (targetCommPort == null || (targetCard == null && !newData.value)) return new Response('Fail');
	if (currentSensor == null) {
		await prisma.sensors.create({
			data: { commPortId: targetCommPort.id, sensorId: newData.sensor, cardId: targetCard?.id }
		});
		return new Response('Ok');
	} else {
		prisma.sensors.update({
			where: { id: currentSensor.id },
			data: { cardId: targetCard?.id }
		});
	}

	return new Response('Ok');
}) satisfies RequestHandler;
