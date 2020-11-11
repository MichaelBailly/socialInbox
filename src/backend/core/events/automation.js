import { ObjectId } from 'mongodb';
import KafkaMessage from '../../kafka/kafka-message';
import db from '../../mongodb';
import logger from '../logger';
import UserProj from '../../../shared/user-proj';
import AutomationCreatedActivity from '../../../shared/automation-created-activity';
import { recordActivity } from '../activity/index';

const debug = logger.extend('events:automation:create');

const NOTIFICATION_NAME = 'automation:created';

export async function automationCreateReceiver(kafkaMessage) {
  const automation = kafkaMessage.payload();
  automation._id = new ObjectId(automation._id);
  const database = await db();
  const collection = database.collection('automations');

  try {
    const { insertedCount } = await collection.insertOne(automation);

    if (insertedCount === 0) {
      throw new Error(
        'No Mongo document has been inserted during update query'
      );
    }
  } catch (e) {
    debug('MongoDB document insert failed: %s %s', e.message, e.stack);
    return false;
  }

  const activity = AutomationCreatedActivity.fromKafkaMessage(kafkaMessage);
  await recordActivity(activity, null, true);
  debug('Notification sent');
}

export const EVENTS = {
  'automation:create': automationCreateReceiver,
};
