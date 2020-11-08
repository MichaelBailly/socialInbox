import logger from '../logger';
import db from '../../mongodb';
import KafkaMessage from '../../kafka/kafka-message';
import sendNotification from '../../kafka/notifications/producer';

const debug = logger.extend('activity');

export async function recordActivity(
  activity,
  emailId = null,
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

  if (!emailId) {
    await recordGlobalActivity(activity);
    if (forwardToNotifications) {
      return sendGlobalActivity(activity);
    }
  } else {
    await recordEmailActivity(emailId, activity);
    if (forwardToNotifications) {
      return sendEmailActivity(activity, emailId);
    }
  }

  return true;
}

const recordGlobalActivity = async (activity) => {
  try {
    const database = await db();
    const collection = database.collection('userinfos');
    const response = await collection.updateOne(
      { _id: activity.actor.id },
      { $push: { activity } }
    );

    if (response.modifiedCount !== 1) {
    }
  } catch (e) {
    debug('DataStore error on activity: %s %s', e.message, e.stack);
    return false;
  }
};

const sendGlobalActivity = (activity) => {
  const payload = { ...activity };
  const kafkaMessage = KafkaMessage.fromObject(activity.actor._id, {
    event: payload.name,
    user: { id: payload.actor._id, email: payload.actor.email },
    payload,
  });
  sendNotification(kafkaMessage);
};

const recordEmailActivity = async (emailId, activity) => {
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
};

const sendEmailActivity = (activity, emailId) => {
  const payload = { ...activity, emailId };
  const kafkaMessage = KafkaMessage.fromObject(activity.actor._id, {
    event: payload.name,
    user: { id: payload.actor._id, email: payload.actor.email },
    payload,
  });
  sendNotification(kafkaMessage);
};
