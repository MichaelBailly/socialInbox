import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import UserProj from '../../../shared/user-proj';
import Automation from '../../../shared/automation';
import { ObjectId } from 'mongodb';
import logger from '../logger';

const debug = logger.extend('commands:automation');

export async function createAutomation(automation, user) {
  const userProj = UserProj.fromObject(user);
  const automationObj = Automation.fromObject(automation);
  automationObj.setId(new ObjectId());
  const kafkaMessage = KafkaMessage.fromObject(user._id, {
    event: 'automation:create',
    user: userProj,
    payload: automationObj,
  });

  debug('Publishing to Kafka %O', kafkaMessage);
  await sendEvent(kafkaMessage);
  return automationObj.id();
}
