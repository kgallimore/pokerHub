import { handler } from './build/handler.js';
import express from 'hyper-express';

const webserver = new express.Server();

// let SvelteKit handle everything else, including serving prerendered pages and static assets
webserver.use(handler);

webserver.listen(3000, () => {
	console.log('listening on port 3000');
});