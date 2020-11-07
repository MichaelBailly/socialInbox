import logger from '../logger';
import db from '../../mongodb';
import KafkaMessage from '../../kafka/kafka-message';
import sendNotification from '../../kafka/notifications/producer';

const debug = logger.extend('activity');

export async function recordActivity(
  activity,
  emailId,
  forwardToNotifications = false
) {
  debug('recordActivity starts for %O', activity);
  if (!activity.name) {
    debug('Activity should have a name: %O', activity);
    return false;
  }
  if (!activity.actor) {
    debug('Activity should have an actor: %O', activity);
    return false;
  }
  if (!activity.actor.id) {
    debug('Activity should have an actor id: %O', activity);
    return false;
  }
  if (!activity.date) {
    debug('Activity should have a date: %O', activity);
    return false;
  }

  try {
    const database = await db();
    const collection = database.collection('emails');
    const response = await collection.updateOne(
      { _id: emailId },
      { $push: { activity } }
    );

    if (response.modifiedCount !== 1) {
    }
  } catch (e) {
    debug('DataStore error on activity: %s %s', e.message, e.stack);
    return false;
  }

  if (forwardToNotifications) {
    return sendActivity(activity, emailId);
  }

  return true;
}

const sendActivity = (activity, emailId) => {
  const payload = { ...activity, emailId };
  const kafkaMessage = KafkaMessage.fromObject(activity.actor._id, {
    event: payload.name,
    user: { id: payload.actor._id, email: payload.actor.email },
    payload,
  });
  sendNotification(kafkaMessage);
};
