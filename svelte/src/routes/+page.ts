import type { CommPorts } from '@prisma/client';

import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const response = await fetch('/api/commPorts');
	const state: { state: CommPorts[] } = await response.json();
	return state;
}) satisfies PageLoad;
