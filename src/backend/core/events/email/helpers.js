import { dbCol } from '../../../mongodb';
import logger from '../../logger/index';
import { parseISO } from 'date-fns';
import KafkaMessage from '../../../kafka/kafka-message';
import sendNotification from '../../../kafka/notifications/producer';
import Actor from '../../../../shared/actor';

const NOTIFICATION_NAME = 'email:delivered';
const UPDATE_NOTIFICATION_NAME = 'email:user:added';
const debug = logger.extend('events:email:helpers');

export const STORE_KIND_CREATE = 'create';
export const STORE_KIND_UPDATE = 'update';

export async function store(user, email) {
  const collection = await dbCol('emails');

  // 1/ try to find email. Email can already be in db if someone else received it
  // email exists. Let's see if the current user is in
  const dbEmail = await findExistingEmail(email);

  if (!dbEmail) {
    const sanitizedEmail = sanitizeEmailToMongodb(email);

    const emailDocument = {
      _id: email.id,
      users: [user._id],
      usersShared: [],
      activity: [],
      labels: [],
      tasks: [],
      email: sanitizedEmail,
      lastModified: sanitizedEmail.receivedAt,
      userState: {
        [user._id]: userState(sanitizedEmail),
      },
    };

    debug('about to record %O', emailDocument);

    await collection.insertOne(emailDocument);
    return [STORE_KIND_CREATE, emailDocument];
  }

  // Email already exist in datastore
  if (dbEmail.users.includes(user._id)) {
    // user is already in, nothing more to do
    return [false, null];
  }

  // add user in the users array, and userState
  const sanitizedEmail = sanitizeEmailToMongodb(email);
  const localUserState = userState(sanitizedEmail);

  debug('about to update existing email with a new user. %O', dbEmail);

  await collection.updateOne(
    { _id: dbEmail._id },
    {
      $push: { users: user._id },
      $set: { [`userState.${user._id}`]: localUserState },
    }
  );

  const e = await collection.findOne({ _id: dbEmail._id });

   return [STORE_KIND_UPDATE, e];
}

export function deliveredNotification(email, user, initialSync = false) {
  return {
    actor: user,
    emailId: email._id,
    initialSync,
  };
}

export function emailUpdatedNotification(email, user) {
  return {
    actor: Actor.fromUser(user),
    emailId: email._id,
  };
}

export async function sendEmailUpdatedNotification(user, payload) {
  const kafkaMessage = KafkaMessage.fromObject(user._id, {
    sender: Actor.fromUser(user),
    event: UPDATE_NOTIFICATION_NAME,
    payload,
  });
  try {
    sendNotification(kafkaMessage);
    debug(
      `Sent notification ${UPDATE_NOTIFICATION_NAME} for user "${user.email}" email "%s"`,
      payload._id
    );
  } catch (e) {
    debug(`Unable to post ${UPDATE_NOTIFICATION_NAME} notification to Kafka: %O`, e);
  }
}

export function sanitizeEmailToMongodb(email) {
  // MongoDB in safe mode forbid fields starting with $. Which is the case for all JMAP keywords
  const kw = email.keywords ? Object.keys(email.keywords) : [];
  const keywords = {};
  // eslint-disable-next-line no-return-assign
  kw.forEach((k) => (keywords[k.replace('$', '')] = email.keywords[k]));
  email.keywords = keywords;

  // change date values to real dates
  email.receivedAt = parseISO(email.receivedAt);

  try {
    email.sentAt = parseISO(email.sentAt);
  } catch (e) {
    debug('No sentAt attribute for email %s', email.id);
  }

  return email;
}

export function userState(email) {
  // seen keyword
  const localUserState = { seen: false };
  if (email.keywords && email.keywords.seen) {
    localUserState.seen = true;
  }
  return localUserState;
}

export async function sendEmailNotification(user, payload) {
  const kafkaMessage = KafkaMessage.fromObject(user._id, {
    sender: Actor.fromUser(user),
    event: NOTIFICATION_NAME,
    payload,
  });
  try {
    sendNotification(kafkaMessage);
    debug(
      `Sent notifiaction ${NOTIFICATION_NAME} for user "${user.email}" email "%s"`,
      payload._id
    );
  } catch (e) {
    debug(`Unable to post ${NOTIFICATION_NAME} notification to Kafka: %O`, e);
  }
}

async function findExistingEmail(email) {
  const collection = await dbCol('emails');
  const existingEmail = await collection.findOne({ 'email.messageId': { $all: email.messageId } });
  return existingEmail;
}
