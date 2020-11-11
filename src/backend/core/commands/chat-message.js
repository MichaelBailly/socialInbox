import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import logger from '../logger';
import Actor from '../../../shared/actor';

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
