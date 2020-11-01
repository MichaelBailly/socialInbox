import KafkaMessage from '../../kafka/kafka-message';
import sendNotification from '../../kafka/notifications/producer';
import db from '../../mongodb/index';
import logger from '../logger/index';
import { parseISO } from 'date-fns';

const debug = logger.extend('events:email:initial-sync');

const NOTIFICATION_NAME = 'email:delivered';

export async function emailInitialSyncReceiver(kafkaMessage) {
  const email = kafkaMessage.payload();
  const user = kafkaMessage.user();
  const database = await db();
  const collection = database.collection('emails');

  // 1/ try to find email. Email can already be in db if someone else received it
  const dbEmail = await collection.findOne({ _id: email.id });

  // email exists. Let's see if the current user is in
  if (dbEmail) {
    if (dbEmail.users.includes(user)) {
      // user is already in, nothing more to do
      return;
    }
    // add user in the users array
    await collection.updateOne({ _id: email.id }, { $push: { users: user } });
    // add user in local array
    dbEmail.users.push(user);
    await sendEmailNotification(user, dbEmail);

    return;
  }

  const emailDocument = {
    _id: email.id,
    users: [user],
    email: sanitizeEmailToMongodb(email),
    lastModified: parseISO(email.receivedAt),
  };

  await collection.insertOne(emailDocument);
  await sendEmailNotification(user, emailDocument);
}

const sendEmailNotification = async(user, dbEmail) => {
  const kafkaMessage = KafkaMessage.fromObject(user, {
    user,
    event: NOTIFICATION_NAME,
    payload: dbEmail,
  });
  try {
    sendNotification(kafkaMessage);
    debug(`Sent notifiaction ${NOTIFICATION_NAME} for user "${user}" email "%s"`, dbEmail._id);
  } catch (e) {
    debug(`Unable to post ${NOTIFICATION_NAME} notification to Kafka: %O`, e);
  }
};

const sanitizeEmailToMongodb = (email) => {
  // MongoDB in safe mode forbid fields starting with $. Which is the case for all JMAP keywords
  const kw = email.keywords ? Object.keys(email.keywords) : [];
  // eslint-disable-next-line no-return-assign
  const nMap = kw.forEach(k => kw[k.replace('$', '')] = email.keywords[k]);
  email.keywords = nMap;

  // change date values to real dates
  email.receivedAt = parseISO(email.receivedAt);

  try {
    email.sentAt = parseISO(email.sentAt);
  } catch (e) {
    debug('No sentAt attribute for email %s', email.id);
  }

  return email;
};
