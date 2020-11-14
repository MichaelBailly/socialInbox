import { getEmailIfAllowed } from '../../../../backend/api-middleware/email-permission';
import { setUserLastSeenMessageId } from '../../../../backend/core/commands/chat-message';
import logger from '../../../../backend/core/logger';

const debug = logger.extend('api:chatmesasges:[emailId]:lastSeen:put');

export async function put(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;
  debug('POST: checking permissions');
  if (!(await getEmailIfAllowed(currentUser, emailId, res))) {
    return;
  }
  debug('POST: checking body');
  if (!req.body) {
    return res.status(400).json({ error: 'request body should be an object' });
  }
  if (!req.body._id || typeof req.body._id !== 'string') {
    return res
      .status(400)
      .json({ error: 'request body should an _id property of type String' });
  }

  try {
    await setUserLastSeenMessageId(currentUser, emailId, req.body._id);
    return res.status(202).send('');
  } catch (e) {
    return res.status(500).json({ messsage: e.message, stack: e.stack });
  }
}
