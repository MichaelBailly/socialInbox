import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import UserProj from '../../../shared/user-proj';
import logger from '../logger';

const debug = logger.extend('commands:label');

export async function createLabel(label, user) {
  const userProj = UserProj.fromObject(user);
  const message = {
    event: 'label:create',
    user: userProj,
    payload: label,
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(userProj._id, message);

  await sendEvent(kafkaMessage);
}
