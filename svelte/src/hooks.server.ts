import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "$lib/pocketbase-types"
import {PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD} from "$env/static/private";

export async function handle({ event, resolve }) {
    event.locals.pb = new PocketBase('http://127.0.0.1:8090') as TypedPocketBase;
    await event.locals.pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    // load the store data from the request cookie string
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
        if(event.locals.pb.authStore.isValid)
            await event.locals.pb.collection('users').authRefresh();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        // clear the auth store on failed refresh
        event.locals.pb.authStore.clear();
    }

    const response = await resolve(event);

    // send back the default 'pb_auth' cookie to the client with the latest store state
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({httpOnly: false}));

    return response;
}