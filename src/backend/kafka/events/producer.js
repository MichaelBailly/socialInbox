import CONSTANTS from '../../constants';
import kafka from '../client';
import logger from '../../core/logger';

const debug = logger.extend('kafka-producer');

const producer = kafka.producer();

const connectPromise = producer.connect();

connectPromise
  .then(() => debug('connected'))
  .catch((e) => {
    debug('connection error %O', e);
    throw e;
  });

export default async function sendEvent(kafkaMessage) {
  const messages = (Array.isArray(kafkaMessage)
    ? kafkaMessage
    : [kafkaMessage]
  ).map((msg) => msg.serialize());

  return connectPromise.then(() => {
    return producer
      .send({
        topic: CONSTANTS.KAFKA.TOPICS.EVENTS.NAME,
        messages,
      })
      .then((response) => {
        debug(`messages sent success (${messages.length} messages)`);
        return response;
      })
      .catch((e) => {
        debug('message send failed: %O', e);
        throw e;
      });
  });
}
