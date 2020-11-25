import logger from '../logger';
import UserNotification from '../../../shared/user-notification';
import { dbCol } from '../../mongodb';
import { ObjectId } from 'bson';
import sendNotification from '../../kafka/notifications/producer';

const debug = logger.extend('events:user-notifications');

export async function userNotificationCreateReceiver(kafkaMessage) {
  let userNotification;
  try {
    userNotification = UserNotification.fromObject(kafkaMessage.payload());
  } catch (e) {
    debug('Invalid payload %s: %O', e.message, kafkaMessage.payload());
  }

  try {
    const collection = await dbCol('userNotifications');
    const { insertedCount } = await collection.insertOne({ ...userNotification, _id: new ObjectId(userNotification._id) });
    if (insertedCount !== 1) {
      throw new Error('No document have been inserted in the datastore.');
    }
  } catch (e) {
    debug('Can not insert new user notification: %s', e.message);
    return;
  }

  const notification = kafkaMessage.setEvent('user:notification:created');

  await sendNotification(notification);
}

export const EVENTS = {
  'user:notification:create': userNotificationCreateReceiver,
};
