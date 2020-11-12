import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import UserProj from '../../../shared/user-proj';
import Actor from '../../../shared/actor';
import Automation from '../../../shared/automation';
import { ObjectId } from 'mongodb';
import logger from '../logger';

const debug = logger.extend('commands:automation');

export async function createAutomation(automation, user) {
  const userProj = Actor.fromUser(user);
  const automationObj = Automation.fromObject(automation);
  automationObj.setId(new ObjectId());
  const kafkaMessage = KafkaMessage.fromObject(user._id, {
    event: 'automation:create',
    sender: userProj,
    payload: automationObj,
  });

  debug('Publishing to Kafka %O', kafkaMessage);
  await sendEvent(kafkaMessage);
  return automationObj.id();
}

export async function updateAutomation(automation, user) {
  const userProj = Actor.fromUser(user);
  const automationObj = Automation.fromObject(automation);
  const kafkaMessage = KafkaMessage.fromObject(user._id, {
    event: 'automation:update',
    sender: userProj,
    payload: automationObj,
  });

  debug('Publishing to Kafka %O', kafkaMessage);
  await sendEvent(kafkaMessage);
  return automationObj;
}
