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
	if (currentSensor == null) throw error(400, { message: 'Unexpected Sensor' });
	const oldCards = currentSensor?.card ?? [];
	// Filter out cards that are already registered
	console.log('NewData:', newData.value);
	if (!Array.isArray(newData.value)) throw error(400, { message: 'Invalid value' });
	const newCards = newData.value.filter((card) => {
		if (!card) return false;
		const findOldIndex = oldCards.findIndex((c) => c.uid === card);
		if (findOldIndex !== -1) oldCards.splice(findOldIndex, 1);
		return findOldIndex === -1;
	});
	if (oldCards.length === 0 && newCards.length === 0)
		throw error(400, { message: 'Cards already registered' });
	const newCardLookups = [
		prisma.commPorts.findFirst({
			where: { commPort: newData.commPort },
			select: { id: true }
		})
	];
	newCards.forEach((card) => {
		console.log('Looking up card', card);
		newCardLookups.push(
			prisma.card.findFirst({
				where: { uid: card },
				select: { id: true }
			})
		);
	});
	const [targetCommPort, ...targetCards] = await Promise.allSettled(newCardLookups);
	if (targetCommPort.status === 'rejected' || targetCommPort.value == null)
		throw error(400, { message: 'Invalid Comm Port' });
	const prismaUpdates = [];
	oldCards.forEach((card) => {
		prismaUpdates.push(
			prisma.sensors.update({
				where: { id: currentSensor.id },
				data: { card: { disconnect: { id: card.id } } }
			})
		);
	});
	for (let i = 0; i < targetCards.length; i++) {
		const targetCard = targetCards[i];
		if (targetCard.status === 'rejected') {
			console.error('DB error');
			continue;
		}
		if (targetCard.value === null) {
			console.warn('card value was null', i);
			continue;
		}
		console.log('Connecting card', targetCard.value);
		prismaUpdates.push(
			prisma.sensors.update({
				where: { id: currentSensor.id },
				data: { card: { connect: { id: targetCard.value.id } } }
			})
		);
	}
	const dbUpdates = await Promise.allSettled(prismaUpdates);
	if (dbUpdates.length > 0)
		throw error(500, { message: 'Failed to fully update database. Errors: ' + dbUpdates.length });
	return new Response('Ok');
}) satisfies RequestHandler;
