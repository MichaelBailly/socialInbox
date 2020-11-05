import sendNotification from '../../../kafka/notifications/producer';
import KafkaMessage from '../../../kafka/kafka-message';
import db from '../../../mongodb';
import logger from '../../logger';
import ChatMessage from '../../../../shared/chat-message';

const debug = logger.extend('events:chat:message:post');

const NOTIFICATION_NAME = 'chat:message:posted';

export async function chatMessagePostReceived(kafkaMessage) {
  const payload = kafkaMessage.payload();
  const chatMessage = new ChatMessage(payload);

  const database = await db();
  const collection = database.collection('chatMessages');

  try {
    const { insertedCount, insertedId } = await collection.insertOne(
      chatMessage.toMongoObject()
    );

    if (insertedCount === 0) {
      throw new Error(
        'No Mongo document has been inserted during update query'
      );
    }

    chatMessage._id = insertedId;
  } catch (e) {
    debug('MongoDB document insert failed: %s %s', e.message, e.stack);
    return false;
  }

  const notificationMessage = KafkaMessage.fromObject(kafkaMessage.key, {
    event: NOTIFICATION_NAME,
    payload: chatMessage,
    user: { id: chatMessage.user._id, email: chatMessage.user.email },
  });
  debug('Sending kafka notification: %O', notificationMessage);
  sendNotification(notificationMessage);
  debug('Notification sent');
}
