import type { CardsResponse, SensorsResponse } from '$lib/pocketbase-types';
import type { PageServerLoad } from './$types';

export const load = (async ({locals}) => {
    const sensors = await locals.pb.collection('Sensors').getFullList<SensorsResponse<{cards:CardsResponse[]}>>({expand: 'cards'});
    return {sensors: sensors};
}) satisfies PageServerLoad;