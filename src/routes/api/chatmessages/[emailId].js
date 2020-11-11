import { ObjectId } from 'mongodb';
import db from '../../../backend/mongodb';
import ChatMessage from '../../../shared/chat-message';
import UserProj from '../../../shared/user-proj';
import { addChatMessage } from '../../../backend/core/commands/chat-message';
import { getEmailIfAllowed } from '../../../backend/api-middleware/email-permission';
import logger from '../../../backend/core/logger';

const debug = logger.extend('api:chatmessages:[emailId]');

export async function post(req, res) {
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

  const body = {
    date: req.body.date,
    body: req.body.body,
    uuid: req.body.uuid,
    _id: new ObjectId(),
  };

  const message = {
    ...body,
    user: UserProj.fromObject(currentUser),
    emailId,
  };

  let chatMessage;
  try {
    chatMessage = new ChatMessage(message);
    debug('POST: calling addChatMessage command');
    addChatMessage(chatMessage);
  } catch (e) {
    return res.status(400).json({ error: e.message, stack: e.stack });
  }

  return res.status(202).json({ _id: body._id });
}

export async function get(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;

  if (!(await getEmailIfAllowed(currentUser, emailId, res))) {
    return;
  }

  const database = await db();
  const collection = database.collection('chatMessages');

  try {
    const messages = await collection
      .find({ emailId })
      .sort({ _id: -1 })
      .limit(50)
      .toArray();
    return res.status(200).json(messages);
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
