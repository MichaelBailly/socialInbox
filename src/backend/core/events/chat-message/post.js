import sendNotification from '../../../kafka/notifications/producer';
import KafkaMessage from '../../../kafka/kafka-message';
import db from '../../../mongodb';
import logger from '../../logger';
import ChatMessage from '../../../../shared/chat-message';
import ChatStartActivity from '../../../../shared/chat-start-activity';
import Actor from '../../../../shared/actor';
import { identifier } from '../../../../shared/chat-start-activity';
import { recordActivity } from '../../activity';

const debug = logger.extend('events:chat:message:post');

const NOTIFICATION_NAME = 'chat:message:posted';

export async function chatMessagePostReceived(kafkaMessage) {
  const payload = kafkaMessage.payload();
  const chatMessage = new ChatMessage(payload);

  const database = await db();
  const collection = database.collection('chatMessages');

  try {
    const { insertedCount } = await collection.insertOne(
      chatMessage.toMongoObject()
    );

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
    payload: chatMessage,
    sender: Actor.fromUser(chatMessage.user),
  });
  debug('Sending kafka notification: %O', notificationMessage);
  sendNotification(notificationMessage);
  debug('Notification sent');
  checkActivity(database, chatMessage);
}

// check if chat:started activity log has already been
// logged
const checkActivity = async (database, chatMessage) => {
  const collection = database.collection('emails');
  try {
    const recordedActivity = await collection.findOne({
      _id: chatMessage.emailId,
      'activity.name': identifier,
    });
    if (recordedActivity) {
      return;
    }
  } catch (e) {
    debug('MongoDb error');
    return false;
  }

  const activity = new ChatStartActivity(Actor.fromUser(chatMessage.user));
  recordActivity(activity, chatMessage.emailId, true);
};

export const EVENTS = {
  'chat:message:post': chatMessagePostReceived,
};
