import sirv from 'sirv';
import * as sapper from '@sapper/server';
import { fastify } from 'fastify';
import fastifyExpress from 'fastify-express';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

startServer();

async function startServer() {
	const server = fastify({ logger: true });

	await server.register(fastifyExpress);
	server.use(sirv('static', { dev }));
	server.use(sapper.middleware());

	await server.listen(PORT);
}
