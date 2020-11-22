import { ObjectId } from 'bson';
import Task from '../../../shared/task';
import TaskCreatedActivity from '../../../shared/task-created-activity';
import TaskDoneStatusUpdatedActivity from '../../../shared/task-done-status-updated-activity';
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

export async function taskDoneStatusUpdateReceiver(kafkaMessage) {
  const debug = debugF.extend('update-done-status');
  const collection = await dbCol('emails');
  console.log(kafkaMessage.payload());
  const { emailId, taskId, done } = kafkaMessage.payload();

  let task;

  try {
    const id = new ObjectId(taskId);
    const email = await collection.findOne({ _id: emailId });
    if (!email) {
      throw new Error(`email with id ${emailId} not found`);
    }
    task = email.tasks.find(t => t._id.equals(id));
    if (!task) {
      throw new Error(`Task ${id} not found in email id ${emailId}`);
    }
  } catch (e) {
    debug('Error: %s', e.message);
    throw e;
  }

  if (task.done === done) {
    debug(`email=${emailId},task=${task._id}: nothing to update, done is already %J`, done);
    return;
  }

  try {
    const { modifiedCount } = await collection.updateOne({ _id: emailId }, {
      $set: {
        'tasks.$[elem].done': done,
      },
    },
    {
      arrayFilters: [
        { 'elem.done': !done },
      ],
    });

    if (modifiedCount !== 1) {
      debug('no note modified after an update request... returning');
      return;
    }
  } catch (e) {
    debug('error duing update process: %s', e.message);
    throw e;
  }

  task.done = done;

  const activity = TaskDoneStatusUpdatedActivity.fromObjects(task, kafkaMessage.sender());

  await recordActivity(activity, task.emailId, true);
}

export const EVENTS = {
  'email:task:create': taskCreateReceiver,
  'email:task:done-status:update': taskDoneStatusUpdateReceiver,
};
