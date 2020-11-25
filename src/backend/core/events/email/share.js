import sendNotification from '../../../kafka/notifications/producer';
import { dbCol } from '../../../mongodb';
import logger from '../../logger';
import EmailShareActivity from '../../../../shared/email-share-activity';
import EmailHead from '../../../../shared/email-head';
import Actor from '../../../../shared/actor';
import { getEmailIfAllowed } from '../../../api-middleware/email-permission';
import KafkaMessage from '../../../kafka/kafka-message';
import UserNotification from '../../../../shared/user-notification';
import { createUserNotification } from '../../commands/user-notification';

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

  const updated = await updateEmailDocument(collection, email, activity, target);
  if (!updated) {
    return;
  }
  const notificationMessage = kafkaMessage.setEvent(NOTIFICATION_NAME);
  await sendNotification(notificationMessage);

  const userNotification = UserNotification.fromObject({
    activity,
    user: target,
    seen: false,
    email: EmailHead.fromEmail(email.email),
    emailId: email._id,
  });

  await createUserNotification(userNotification, kafkaMessage.sender());
}

const updateEmailDocument = async (collection, email, activity, target) => {
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
  return true;
};

export const EVENTS = {
  'email:share': emailShareReceiver,
};
