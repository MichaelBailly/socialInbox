import sendNotification from '../../../kafka/notifications/producer';
import { dbCol } from '../../../mongodb';
import logger from '../../logger';
import EmailShareActivity from '../../../../shared/email-share-activity';
import Actor from '../../../../shared/actor';
import { getEmailIfAllowed } from '../../../api-middleware/email-permission';

const debug = logger.extend('events:email:share');

const NOTIFICATION_NAME = 'email:shared';

export async function emailShareReceiver(kafkaMessage) {
  const payload = kafkaMessage.payload();

  const actor = Actor.fromObject(payload.actor);
  const target = Actor.fromUser(payload.target);
  const activity = new EmailShareActivity(actor, target);

  const collection = await dbCol('emails');
  const email = await getEmailIfAllowed(actor, payload.emailId);

  if (!email) {
    debug(`Email id ${payload.emailId} does not exist`);
    return false;
  }

  if (
    email.usersShared.includes(target.id()) ||
    email.users.includes(target.id())
  ) {
    debug(`User ${target.id()} already in email ${email._id}`);
    return false;
  }

  try {
    const { modifiedCount } = await collection.updateOne(
      { _id: email._id },
      {
        $push: {
          usersShared: target.id(),
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
