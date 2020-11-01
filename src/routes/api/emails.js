import db from '../../backend/mongodb/index';
import logger from '../../backend/core/logger';

const debug = logger.extend('api:emails');

const DEFAULT_LIMIT = 30;
const DEFAULT_OFFSET = 0;

/*
  Get emails

  query params:
  - limit: number of items to send, maximum
  - offset: number of item to start with
*/
export async function get(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not connected' });
  }

  const limit = Number(req.query.limit) || DEFAULT_LIMIT;
  const offset = Number(req.query.offset) || DEFAULT_OFFSET;

  const email = req.session.user.email;
  try {
    const database = await db();
    const collection = database.collection('emails');
    const emails = await collection.find({ users: email }).sort({ receivedAt: -1 }).skip(offset).limit(limit).toArray();

    debug('email fetch response OK, returning %i emails', emails.length);
    return res.status(200).json({ emails });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
