import sendNotification from '../../../kafka/notifications/producer';
import db from '../../../mongodb';
import logger from '../../logger';
import EmailShareActivity from '../../../../shared/email-share-activity';
import UserProj from '../../../../shared/user-proj';

const debug = logger.extend('events:email:share');

const NOTIFICATION_NAME = 'email:shared';

export async function emailShareReceiver(kafkaMessage) {
  const payload = kafkaMessage.payload();

  const actorProj = UserProj.fromObject(payload.actor);
  const targetProj = UserProj.fromObject(payload.target);
  const activity = new EmailShareActivity(actorProj, targetProj);

  const database = await db();
  const collection = database.collection('emails');

  const email = await collection.findOne({ _id: payload.emailId });

  if (!email) {
    debug(`Email id ${payload.emailId} does not exist`);
    return false;
  }

  if (
    email.usersShared.includes(targetProj.id()) ||
    email.users.includes(targetProj.id())
  ) {
    debug(`User ${targetProj.id()} already in email ${email._id}`);
    return false;
  }

  try {
    const { modifiedCount } = await collection.updateOne(
      { _id: email._id },
      {
        $push: {
          usersShared: targetProj.id(),
          activity,
        },
        $set: { lastModified: new Date() },
      }
    );

    if (!modifiedCount) {
      throw new Error('No Mongo document has been updated during update query');
    }
  } catch (e) {
    debug('MongoDB document update failed: %s %s', e.message, e.stack);
    return false;
  }

  const notificationMessage = kafkaMessage.setEvent(NOTIFICATION_NAME);
  sendNotification(notificationMessage);
}

export const EVENTS = {
  'email:share': emailShareReceiver,
};
