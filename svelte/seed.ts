import 'dotenv/config'

import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "./src/lib/pocketbase-types"
import userData from '../comm/cardCodes.json' assert { type: 'json' };

const pb = new PocketBase('http://127.0.0.1:8090') as TypedPocketBase;
await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

for (const [uid, card] of Object.entries(userData)) {
	await pb.collection("Cards").create({
			suit: card.suit,
			rank: card.card,
			uid
		
	});
}
console.log(`Seeding finished.`);

