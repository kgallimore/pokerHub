//import type { CardsResponse, SensorsResponse } from '$lib/pocketbase-types';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    //const sensors = await locals.pb.collection('Sensors').getFullList<SensorsResponse<{cards:CardsResponse[]}>>({expand: 'cards'});
    //return {sensors: sensors};
    return {};
}) satisfies PageServerLoad;