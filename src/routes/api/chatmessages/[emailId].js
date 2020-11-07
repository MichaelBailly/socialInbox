import db from '../../../backend/mongodb';
import ChatMessage from '../../../shared/chat-message';
import UserProj from '../../../shared/user-proj';
import { addChatMessage } from '../../../backend/core/commands/chat-message';
import logger from '../../../backend/core/logger';

const debug = logger.extend('api:chatmessages:[emailId]');

export async function post(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;
  debug('POST: checing permissions');
  if (!checkPermission(currentUser, emailId, res)) {
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

  return res.status(201).send('');
}

export async function get(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;

  if (!checkPermission(currentUser, emailId, res)) {
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

async function checkPermission(currentUser, emailId, res) {
  const database = await db();
  const emailCollection = database.collection('emails');
  const email = await emailCollection.findOne({ _id: emailId });

  if (!email) {
    res.status(404).json({ error: `email ${emailId} no found` });
    return false;
  }

  // user should have already access to email to share
  if (
    !email.users.includes(currentUser._id) &&
    !email.usersShared.includes(currentUser._id)
  ) {
    return res
      .status(401)
      .json({ error: 'Not authorized to share this email' });
  }
  return true;
}
