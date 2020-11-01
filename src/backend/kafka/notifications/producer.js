import CONSTANTS from '../../constants';
import kafka from '../client';
import logger from '../../core/logger';

const debug = logger.extend('kafka-notifications-producer');

const producer = kafka.producer();

const connectPromise = producer.connect();

connectPromise
  .then(() => debug('connected'))
  .catch((e) => {
    debug('connection error %O', e);
    throw e;
  });

export default async function sendNotification(kafkaMessage) {
  const messages = (Array.isArray(kafkaMessage)
    ? kafkaMessage
    : [kafkaMessage]
  ).map((msg) => msg.serialize());

  return connectPromise.then(() => {
    return producer
      .send({
        topic: CONSTANTS.KAFKA.TOPICS.NOTIFICATIONS,
        messages,
      })
      .then((response) => {
        return response;
      })
      .catch((e) => {
        debug('message send failed: %O', e);
        throw e;
      });
  });
}
