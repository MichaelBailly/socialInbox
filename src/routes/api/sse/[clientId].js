import logger from '../../../backend/core/logger';
import createConsumer from '../../../backend/kafka/notifications/consumer';
import { getEmailIfAllowed } from '../../../backend/api-middleware/email-permission';
import Actor from '../../../shared/actor';

const debugG = logger.extend('sse');
let sseSessionCounter = 0;

export async function get(req, res) {
  if (!req.session || !req.session.user || !req.session.user._id) {
    return res.status(401).json({ error: 'Authentication needed' });
  }

  const clientId = req.params.clientId;

  if (clientId.length < 12) {
    return res
      .status(400)
      .json({ error: 'clientId should be at least 12 chars long' });
  }

  const user = Actor.fromUser(req.session.user);
  const userId = req.session.user._id;
  const send = sendEvent(res);

  const sseSession = ++sseSessionCounter;
  const debug = debugG.extend(`${sseSession}`);

  debug(`${userId}/${req.session.user.email} connected`);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  const pingInterval = setInterval(() => {
    send('ping', { date: Date.now() });
  }, 3000);

  const eventCallbackArgs = {
    user,
    userId,
    res,
    debug,
    send,
  };

  // connect consumer

  const consumer = await createConsumer(clientId, ({ kafkaMessage }) => {
    debug('received Kafka message: %o', kafkaMessage);
    if (kafkaMessage.event() === 'email:shared') {
      emailSharedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'chat:message:posted') {
      chatMessagePostedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'chat:started') {
      chatStartedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'label:created') {
      labelCreatedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'email:label:added') {
      emailLabelAddedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'email:label:removed') {
      emailLabelRemovedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'automation:created') {
      automationCreatedEvent(kafkaMessage, eventCallbackArgs);
    } else if (kafkaMessage.event() === 'email:delivered') {
      emailDeliveredEvent(kafkaMessage, eventCallbackArgs);
    }
  });

  // Handle client disconnet

  req.on('close', () => {
    debug('Connection closed');
    console.log(consumer);
    consumer.disconnect();
    clearInterval(pingInterval);
  });
}

function sendEvent(res) {
  return (name, payload) => {
    res.write(`event: ${name}
data: ${JSON.stringify(payload)}

`);
  };
}

const sendToAll = async (kafkaMessage, { send }) => {
  send(kafkaMessage.event(), kafkaMessage.payload());
};

const sendIfUserIsInEmail = async (kafkaMessage, { user, send, debug }) => {
  const payload = kafkaMessage.payload();
  const email = await getEmailIfAllowed(user, payload.emailId);
  if (!email) {
    debug('email not found or user not in email users/usersShared');
    return;
  }
  send(kafkaMessage.event(), payload);
};

const emailDeliveredEvent = async (kafkaMessage, { user, send, debug }) => {
  const payload = { ...kafkaMessage.payload() };
  const email = await getEmailIfAllowed(user, payload.emailId);
  if (!email) {
    debug('email not found or user not in email users/usersShared');
    return;
  }
  payload.email = email;

  send(kafkaMessage.event(), payload);
};

const emailSharedEvent = sendIfUserIsInEmail;
const chatMessagePostedEvent = sendIfUserIsInEmail;
const chatStartedEvent = sendIfUserIsInEmail;
const labelCreatedEvent = sendToAll;
const emailLabelAddedEvent = sendIfUserIsInEmail;
const emailLabelRemovedEvent = sendIfUserIsInEmail;
const automationCreatedEvent = sendToAll;
