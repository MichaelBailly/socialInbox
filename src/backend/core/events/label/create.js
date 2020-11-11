import { ObjectId } from 'mongodb';
import KafkaMessage from '../../../kafka/kafka-message';
import db from '../../../mongodb';
import logger from '../../logger';
import Actor from '../../../../shared/actor';
import LabelCreateActivity from '../../../../shared/label-create-activity';
import { recordActivity } from '../../activity/index';

const debug = logger.extend('events:label:create');

const NOTIFICATION_NAME = 'label:created';

export async function labelCreateReceiver(kafkaMessage) {
  const label = { ...kafkaMessage.payload() };
  label._id = new ObjectId(label._id);

  const database = await db();
  const collection = database.collection('labels');

  try {
    const { insertedCount } = await collection.insertOne(label);

    if (insertedCount === 0) {
      throw new Error(
        'No Mongo document has been inserted during update query'
      );
    }
  } catch (e) {
    debug('MongoDB document insert failed: %s %s', e.message, e.stack);
    return false;
  }

  const notificationMessage = KafkaMessage.fromObject(kafkaMessage.key, {
    event: NOTIFICATION_NAME,
    payload: label,
    sender: kafkaMessage.sender(),
  });
  debug('Sending kafka notification: %O', notificationMessage);
  const activity = new LabelCreateActivity(
    Actor.fromObject(kafkaMessage.sender()),
    label
  );
  await recordActivity(activity, null, true);
  debug('Notification sent');
}

export const EVENTS = {
  'label:create': labelCreateReceiver,
};
