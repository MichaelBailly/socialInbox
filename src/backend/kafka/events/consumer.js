import CONSTANTS from '../../constants';
import kafka from '../client';
import logger from '../../core/logger';
import { eventsListeners } from '../../core/events';
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
  let kafkaMessage;
  try {
    kafkaMessage = KafkaMessage.fromKafka(
      message.key.toString(),
      message.value.toString()
    );
  } catch (e) {
    debug('message received, conversion to kafkaMessage failed: %s', e.message);
  }
  debug('message received. Event=%s', kafkaMessage.event());

  eventsListeners[kafkaMessage.event()] &&
    eventsListeners[kafkaMessage.event()](kafkaMessage);
};
