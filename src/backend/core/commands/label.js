import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import UserProj from '../../../shared/user-proj';
import logger from '../logger';

const debug = logger.extend('commands:label');

export function createLabel(label, user) {
  const userProj = UserProj.fromObject(user);
  const message = {
    event: 'label:create',
    user: { ...userProj, id: userProj._id },
    payload: label,
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(message.user.id, message);

  sendEvent(kafkaMessage);
}
