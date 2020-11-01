import CONSTANTS from '../../constants';
import kafka from '../client';
import logger from '../../core/logger';
import KafkaMessage from '../kafka-message';

const debugNotif = logger.extend('kafka-notification-consumer');

export default function createConsumer(groupId, onMessage) {
  run(groupId, onMessage);
};

async function run(groupId, onMessage) {
  const debug = debugNotif.extend(groupId);
  const consumer = kafka.consumer({ groupId });

  try {
    debug('connecting');
    await consumer.connect();
  } catch (e) {
    debug('connection failed: %O', e);
    process.exit(1);
  }

  try {
    debug('subscribing');
    await consumer.subscribe({ topic: CONSTANTS.KAFKA.TOPICS.NOTIFICATIONS });
  } catch (e) {
    debug('subscription failed: %O', e);
    process.exit(1);
  }

  try {
    debug('starting message consuming');
    await consumer.run({
      eachMessage: async({ topic, partition, message }) => {
        const kafkaMessage = KafkaMessage.fromKafka(message.key.toString(), message.value.toString());
        return onMessage({ topic, partition, message, kafkaMessage });
      },
    });
  } catch (e) {
    debug('message consuming failed: %O', e);
  }

  return consumer;
}
