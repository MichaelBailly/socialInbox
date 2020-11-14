import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import logger from '../logger';
import Actor from '../../../shared/actor';
import { ObjectId } from 'mongodb';

const debug = logger.extend('commands:chat-message');

export function addChatMessage(chatMessage) {
  const message = {
    event: 'chat:message:post',
    sender: Actor.fromUser(chatMessage.user),
    payload: chatMessage,
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(chatMessage.user._id, message);

  sendEvent(kafkaMessage);
}

export async function setUserLastSeenMessageId(user, emailId, messageId) {
  const id = new ObjectId(messageId);
  const message = {
    event: 'events:chat-message:last-seen-pointer:update',
    sender: Actor.fromUser(user),
    payload: {
      messageId: id,
      emailId,
    },
  };

  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(user._id, message);

  await sendEvent(kafkaMessage);
}
