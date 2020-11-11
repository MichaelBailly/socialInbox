import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import Actor from '../../../shared/actor';
import logger from '../logger';

const debug = logger.extend('commands:label');

export async function createLabel(label, user) {
  const userProj = Actor.fromUser(user);
  const message = {
    event: 'label:create',
    sender: userProj,
    payload: label,
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(userProj._id, message);

  await sendEvent(kafkaMessage);
}
