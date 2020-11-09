import CONSTANTS from '../../constants';
import kafka from '../client';
import logger from '../../core/logger';
import { jwtTokenReceiver } from '../../core/events/jwt';
import { emailInitialSyncReceiver } from '../../core/events/email-initial-sync';
import { emailShareReceiver } from '../../core/events/email/share';
import { chatMessagePostReceived } from '../../core/events/chat-message/post';
import { labelCreateReceived } from '../../core/events/label/create';
import { emailLabelsUpdateReceiver } from '../../core/events/email/labels-update';
import KafkaMessage from '../kafka-message';

const debug = logger.extend('kafka-consumer');

const consumer = kafka.consumer({
  groupId: CONSTANTS.KAFKA.TOPICS.EVENTS.CONSUMER_GROUP,
});

export default async function run() {
  try {
    debug('connecting');
    await consumer.connect();
  } catch (e) {
    debug('connection failed: %O', e);
    process.exit(1);
  }

  try {
    debug('subscribing');
    await consumer.subscribe({ topic: CONSTANTS.KAFKA.TOPICS.EVENTS.NAME });
  } catch (e) {
    debug('subscription failed: %O', e);
    process.exit(1);
  }

  try {
    debug('starting message consuming');
    await consumer.run({
      eachMessage: onMessage,
    });
  } catch (e) {
    debug('message consuming failed: %O', e);
  }
}

const onMessage = async ({ topic, partition, message }) => {
  const kafkaMessage = KafkaMessage.fromKafka(
    message.key.toString(),
    message.value.toString()
  );

  if (kafkaMessage.event() === 'jwt:token') {
    jwtTokenReceiver(kafkaMessage);
  } else if (kafkaMessage.event() === 'email:initial-sync') {
    emailInitialSyncReceiver(kafkaMessage);
  } else if (kafkaMessage.event() === 'email:share') {
    emailShareReceiver(kafkaMessage);
  } else if (kafkaMessage.event() === 'chat:message:post') {
    chatMessagePostReceived(kafkaMessage);
  } else if (kafkaMessage.event() === 'label:create') {
    labelCreateReceived(kafkaMessage);
  } else if (kafkaMessage.event() === 'email:labels:update') {
    emailLabelsUpdateReceiver(kafkaMessage);
  }
};
