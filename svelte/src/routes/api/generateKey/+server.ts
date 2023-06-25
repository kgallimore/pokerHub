import type { RequestHandler } from './$types';
import prisma from '$lib/prisma';
//import { hash } from 'bcrypt';

export const GET: RequestHandler = async () => {
	const uuid = crypto.randomUUID();
	//console.log(uuid);
	//const hashed = await hash(uuid, 10);
	await prisma.apiKeys.create({ data: { value: uuid } });
	return new Response(uuid);
};
