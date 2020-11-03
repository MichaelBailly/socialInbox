import db from '../../backend/mongodb/index';
import fetch from 'node-fetch';
import { URL } from 'url';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

export async function get(req, res) {
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ error: 'must be authenticated to access this resource '});
  }

  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: 'Avatar GET: email is mandatory'});
  }
  const name = req.query.name || req.query.email;
  const size = req.query.size ? Number(req.query.size) : 48;
  const database = await db();
  const collection = database.collection('userinfos');
  const userinfos = await collection.findOne({ _id: req.session.user._id });

  const token = userinfos.token;

  if (!token) {
    return res.status(400).json({ error: 'No JWT authentication token for user'});
  }

  const url = new URL('/api/avatars', process.env.OPENPAAS_URL);
  url.searchParams.append('email', email);
  url.searchParams.append('objectType', 'email');
  url.searchParams.append('displayName', name);
  url.searchParams.append('size', size);

  const response = await fetch(url);
  if (!response.ok) {
    return res.status(response.status).json({ error: response.statusText });
  }
  res.set('Content-Type', response.headers.get('content-type'));

  return streamPipeline(response.body, res);
}
