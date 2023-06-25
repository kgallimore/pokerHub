import prisma from '$lib/prisma';
import { json, error } from '@sveltejs/kit';
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
	console.log(newData, currentSensor);
	if (currentSensor == null) throw error(400, { message: 'Unexpected Sensor' });
	if (currentSensor?.card?.uid === newData.value)
		throw error(400, { message: 'Card already registered' });
	const [targetCommPort, targetCard] = await Promise.allSettled([
		prisma.commPorts.findFirst({
			where: { commPort: newData.commPort },
			select: { id: true }
		}),
		prisma.card.findFirst({
			where: { uid: newData.value },
			select: { id: true }
		})
	]);
	if (targetCommPort.status === 'rejected' || targetCommPort.value == null)
		throw error(400, { message: 'Invalid Comm Port' });
	if (targetCard.status === 'rejected' || (targetCard.value == null && newData.value != ''))
		throw error(400, { message: 'Invalid Card' });
	await prisma.sensors.update({
		where: { id: currentSensor.id },
		data: { cardId: targetCard.value?.id ?? null }
	});
	return new Response('Ok');
}) satisfies RequestHandler;
