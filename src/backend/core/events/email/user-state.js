import Actor from '../../../../shared/actor';
import KafkaMessage from '../../../kafka/kafka-message';
import sendNotification from '../../../kafka/notifications/producer';
import { dbCol } from '../../../mongodb';
import logger from '../../logger';

const debug = logger.extend('events:email:user-state');

export async function emailUserStateSeenUpdateReceiver(kafkaMessage) {
  debug('emailUserStateSeenUpdate starts');

  const NOTIFICATION_NAME = 'email:user-state:seen:updated';
  const actor = kafkaMessage.sender();
  const payload = kafkaMessage.payload();
  const { emailId, state } = payload;

  const collection = await dbCol('emails');

  let isModified;

  try {
    const response = await collection.updateOne({ _id: emailId }, {
      $set: {
        [`userState.${actor._id}.seen`]: state,
      },
    });
    isModified = response.modifiedCount;
  } catch (e) {
    debug('Error updating email in datastore: %s %s', e.message, e.stack);
  }
  debug('DB update ended for setting user %s seen state, isModified = %i', actor._id, isModified);

  if (isModified) {
    debug(`Sending notification ${NOTIFICATION_NAME}`);
    const notificationMessage = kafkaMessage.setEvent(NOTIFICATION_NAME);

    try {
      await sendNotification(notificationMessage);
    } catch (e) {
      debug('Error sending email user state "seen" change notification: %s %s', e.message, e.stack);
    }
  }
};

export const EVENTS = {
  'email:user-state:seen:update': emailUserStateSeenUpdateReceiver,
};
