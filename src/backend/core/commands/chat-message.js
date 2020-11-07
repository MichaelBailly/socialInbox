import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import logger from '../logger';

const debug = logger.extend('commands:chat-message');

export function addChatMessage(chatMessage) {
  const message = {
    event: 'chat:message:post',
    user: { id: chatMessage.user._id, email: chatMessage.user.email },
    payload: chatMessage,
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(chatMessage.user._id, message);

  sendEvent(kafkaMessage);
}
