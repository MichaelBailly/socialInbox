import { ObjectId } from 'bson';
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
