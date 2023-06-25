import type { Prisma } from '@prisma/client';

import type { PageLoad } from './$types';

type CommPortsWithSensors = Prisma.CommPortsGetPayload<{
	include: { sensors: { include: { card: true } } };
}>;

export const load = (async ({ fetch }) => {
	const response = await fetch('/api/commPorts');
	const state: { state: CommPortsWithSensors[] } = await response.json();
	return state;
}) satisfies PageLoad;
