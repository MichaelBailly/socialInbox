import { ObjectId } from 'mongodb';
import { dbCol } from '../../../mongodb';
import logger from '../../logger';
import sendNotification from '../../../kafka/notifications/producer';
import KafkaMessage from '../../../kafka/kafka-message';

const debug = logger.extend('events:chat-message:last-seen-pointer:update');

export async function chatMessageLastSeenPointerUpdateReceived(kafkaMessage) {
  const payload = kafkaMessage.payload();
  debug('received kafkaMessage %s: %O', kafkaMessage.event(), payload);
  const messageId = new ObjectId(payload.messageId);
  const emailId = payload.emailId;

  const chatCollection = await dbCol('chatMessages');
  const message = await chatCollection.findOne({ _id: messageId });
  if (!message) {
    throw new Error('Invalid message id');
  }

  const ts = message.date.getTime();

  const documentSelector = { emailId, userId: kafkaMessage.sender()._id };

  const collection = await dbCol('chatMessagesUserData');
  const userDocument = await collection.findOne(documentSelector);
  const documentContents = { lastSeenMessage: { id: messageId, ts } };

  let response;
  if (userDocument) {
    if (userDocument.lastSeenMessage && userDocument.lastSeenMessage.ts >= ts) {
      debug(
        'Last seend mesasge in datastore is greater or equal to the current one: ignoring.'
      );
      return;
    }

    response = await collection.updateOne(
      { _id: userDocument._id },
      { $set: documentContents }
    );
  } else {
    response = await collection.insertOne({
      ...documentSelector,
      ...documentContents,
    });
  }

  debug('update last seen pointer upsert: %O', response.result);

  const notificationMessage = KafkaMessage.fromObject(kafkaMessage.key, {
    sender: kafkaMessage.sender(),
    event: 'chat-message:last-seen-pointer:updated',
    payload: { ...kafkaMessage.payload(), ts },
  });

  debug('Sending kafka notification: %O', notificationMessage);
  sendNotification(notificationMessage);
}

export const EVENTS = {
  'chat-message:last-seen-pointer:update': chatMessageLastSeenPointerUpdateReceived,
};
