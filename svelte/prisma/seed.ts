// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import userData from '../../comm/cardCodes.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
	for (const [uid, card] of Object.entries(userData)) {
		await prisma.card.create({
			data: {
				suit: card.suit,
				card: card.card,
				uid
			}
		});
	}
	console.log(`Seeding finished.`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
