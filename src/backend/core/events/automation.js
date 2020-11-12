import { ObjectId } from 'mongodb';
import { dbCol } from '../../mongodb';
import logger from '../logger';
import AutomationCreatedActivity from '../../../shared/automation-created-activity';
import AutomationUpdatedActivity from '../../../shared/automation-updated-activity';
import { recordActivity } from '../activity/index';

const debug = logger.extend('events:automation:create');

const NOTIFICATION_NAME = 'automation:created';

export async function automationCreateReceiver(kafkaMessage) {
  const automation = kafkaMessage.payload();
  automation._id = new ObjectId(automation._id);
  const collection = await dbCol('automations');

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

export async function automationUpdateReceiver(kafkaMessage) {
  const automation = kafkaMessage.payload();
  automation._id = new ObjectId(automation._id);
  const collection = await dbCol('automations');

  try {
    const { modifiedCount } = await collection.replaceOne(
      { _id: automation._id },
      automation
    );

    if (modifiedCount === 0) {
      throw new Error('No Mongo document has been updated during update query');
    }
  } catch (e) {
    debug('MongoDB document insert failed: %s %s', e.message, e.stack);
    return false;
  }

  const activity = AutomationUpdatedActivity.fromKafkaMessage(kafkaMessage);
  await recordActivity(activity, null, true);
  debug('Notification sent');
}

export const EVENTS = {
  'automation:create': automationCreateReceiver,
  'automation:update': automationUpdateReceiver,
};
