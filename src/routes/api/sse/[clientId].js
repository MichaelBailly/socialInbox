import logger from '../../../backend/core/logger';
import createConsumer from '../../../backend/kafka/notifications/consumer';
import db from '../../../backend/mongodb';

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

const emailSharedEvent = async (kafkaMessage, { userId, debug, send }) => {
  const payload = kafkaMessage.payload();
  const database = await db();
  const collection = database.collection('emails');
  const email = await collection.findOne({ _id: payload.emailId });
  if (!email) {
    debug(`Email ${payload.emailId} not found`);
    return;
  }

  if (email.users.concat(email.usersShared).includes(userId)) {
    send(kafkaMessage.event(), payload);
  }
};

const chatMessagePostedEvent = async (
  kafkaMessage,
  { userId, debug, send }
) => {
  const payload = kafkaMessage.payload();
  const database = await db();
  const collection = database.collection('emails');
  const email = await collection.findOne({ _id: payload.emailId });
  if (!email) {
    debug(`Email ${payload.emailId} not found`);
    return;
  }

  if (email.users.concat(email.usersShared).includes(userId)) {
    send(kafkaMessage.event(), payload);
  }
};

const chatStartedEvent = async (kafkaMessage, { userId, debug, send }) => {
  const payload = kafkaMessage.payload();
  const database = await db();
  const collection = database.collection('emails');
  const email = await collection.findOne({ _id: payload.emailId });
  if (!email) {
    debug(`Email ${payload.emailId} not found`);
    return;
  }

  if (email.users.concat(email.usersShared).includes(userId)) {
    send(kafkaMessage.event(), payload);
  }
};
