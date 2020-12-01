import logger from '../logger';
import UserNotification from '../../../shared/user-notification';
import { dbCol } from '../../mongodb';
import { ObjectId } from 'bson';
import sendNotification from '../../kafka/notifications/producer';
import Actor from '../../../shared/actor';
import KafkaMessage from '../../kafka/kafka-message';

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

export async function userNotificationsMarkSeenReceiver(kafkaMessage) {
  const payload = kafkaMessage.payload();
  const user = Actor.fromObject(payload.user);
  const query = {
    'user._id': user._id,
    seen: false,
  };
  if (payload.criteria === 'activityDate') {
    const date = new Date(payload.criteriaValue);
    query['activity.date'] = {
      $lte: date,
    };
  } else if (payload.criteria === 'id') {
    const _id = new ObjectId(payload.criteriaValue);
    query._id = _id;
  } else {
    debug('markSeenReceiver: unknown criteria: %s', payload.criteria);
    return false;
  }

  debug('markSeenReceiver: Mongo Query %O', query);

  const collection = await dbCol('userNotifications');
  let notificationIds;
  try {
    const notifications = await collection.find(query, { emailId: 1 }).toArray();
    notificationIds = notifications.map(d => d._id);
    if (!notificationIds.length) {
      debug('markSeenReveiver: no notification to update');
      return true;
    }
  } catch (e) {
    debug('markSeenReceiver: Error during MongoDB query: %s', e.message);
    return false;
  }

  debug('markSeenReceiver: %i notifications to update', notificationIds.length);

  try {
    await collection.updateMany({
      _id: { $in: notificationIds },
    }, {
      $set: { seen: true },
    });
  } catch (e) {
    debug('markSeenReceiver: Error during MongoDB update query: %s', e.message);
    return false;
  }

  const notification = KafkaMessage.fromObject(user._id, {
    sender: kafkaMessage.sender(),
    event: 'user:notifications:seen:updated',
    payload: {
      user,
      ids: notificationIds,
      date: new Date(),
    },
  });

  try {
    await sendNotification(notification);
  } catch (e) {
    debug('markSeenReceiver: Error sending notification: %s', e.message);
    return true;
  }
}

export const EVENTS = {
  'user:notification:create': userNotificationCreateReceiver,
  'user:notifications:mark-seen': userNotificationsMarkSeenReceiver,
};
