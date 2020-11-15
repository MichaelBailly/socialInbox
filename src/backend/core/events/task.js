import Task from '../../../shared/task';
import TaskCreatedActivity from '../../../shared/task-created-activity';
import { dbCol } from '../../mongodb';
import { recordActivity } from '../activity';
import logger from '../logger';

const debugF = logger.extend('events:task');

export async function taskCreateReceiver(kafkaMessage) {
  const debug = debugF.extend('create');
  const collection = await dbCol('emails');
  const task = Task.fromObject(kafkaMessage.payload());

  try {
    const response = await collection.updateOne(
      { _id: task.emailId },
      {
        $push: {
          tasks: task,
        },
      }
    );

    if (response.modifiedCount !== 1) {
      throw new Error('No document updated during query');
    }
  } catch (e) {
    debug('MongoDB creation query failed');
    throw e;
  }
  debug('Datastore document updated (emailId=%s)', task.emailId);

  const activity = TaskCreatedActivity.fromKafkaMessage(kafkaMessage);

  await recordActivity(activity, task.emailId, true);
}

export const EVENTS = {
  'email:task:create': taskCreateReceiver,
};
