import { ObjectId } from 'bson';
import Actor from '../../../shared/actor';
import UserNotification from '../../../shared/user-notification';
import sendEvent from '../../kafka/events/producer';
import KafkaMessage from '../../kafka/kafka-message';
import logger from '../logger';
/**
 * A user notification is associated with an activity
 *
 *
 * Should have:
 * - activity: Object notification activity
 * - user: Actor notification user target
 *
 * may have:
 * - emailId(String) and email(EmailHead)
 *
 */

const debug = logger.extend('commands:user-notification');

export async function createUserNotification(notification, sender) {
  let userNotification;
  const _id = new ObjectId();
  try {
    userNotification = UserNotification.fromObject({ ...notification, _id });
  } catch (e) {
    debug('Bad parameter: %O', e.message);
    throw e;
  }

  const kafkaMessage = KafkaMessage.fromObject(userNotification.user._id, {
    event: 'user:notification:create',
    sender,
    payload: userNotification,
  });

  await sendEvent(kafkaMessage);
}

export async function markSeenBefore(date, sender) {
  if (!(date instanceof Date)) {
    const error = new Error({ error: 'date should be a Date instance' });
    error.status = 400;
    throw error;
  }
  return await markSeen('activityDate', date, sender);
}

export async function markSeenById(id, sender) {
  if (!(id instanceof ObjectId)) {
    const error = new Error({ error: 'id should be an ObjectId instance' });
    error.status = 400;
    throw error;
  }
  return await markSeen('id', id, sender);
}

async function markSeen(criteria, criteriaValue, sender) {
  if (!(sender instanceof Actor)) {
    const error = new Error({ error: 'sender should be an Actor instance' });
    error.status = 400;
    throw error;
  }

  const kafkaMessage = KafkaMessage.fromObject(sender._id, {
    event: 'user:notifications:mark-seen',
    sender,
    payload: {
      criteria,
      criteriaValue,
      user: sender,
    },
  });

  return await sendEvent(kafkaMessage);
}
