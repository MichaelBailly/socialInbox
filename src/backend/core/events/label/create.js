import sendNotification from '../../../kafka/notifications/producer';
import KafkaMessage from '../../../kafka/kafka-message';
import db from '../../../mongodb';
import logger from '../../logger';
import UserProj from '../../../../shared/user-proj';
import LabelCreateActivity from '../../../../shared/label-create-activity';
import { recordActivity } from '../../activity/index';

const debug = logger.extend('events:label:create');

const NOTIFICATION_NAME = 'label:created';

export async function labelCreateReceived(kafkaMessage) {
  const label = kafkaMessage.payload();

  const database = await db();
  const collection = database.collection('labels');

  try {
    const { insertedCount, insertedId } = await collection.insertOne(label);

    if (insertedCount === 0) {
      throw new Error(
        'No Mongo document has been inserted during update query'
      );
    }

    label._id = insertedId;
  } catch (e) {
    debug('MongoDB document insert failed: %s %s', e.message, e.stack);
    return false;
  }

  const notificationMessage = KafkaMessage.fromObject(kafkaMessage.key, {
    event: NOTIFICATION_NAME,
    payload: label,
    user: kafkaMessage.user(),
  });
  debug('Sending kafka notification: %O', notificationMessage);
  sendNotification(notificationMessage);
  debug('Notification sent');

  const activity = new LabelCreateActivity(
    UserProj.fromObject(kafkaMessage.user()),
    label
  );
  recordActivity(activity, null, true);
}
