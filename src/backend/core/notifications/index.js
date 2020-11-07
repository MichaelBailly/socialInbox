import CONSTANTS from '../../constants';
import logger from '../logger';
import createConsumer from '../../kafka/notifications/consumer';

const debug = logger.extend('notifications');

let consumer;
const events = {};

export default function onNotification(name, callback) {
  if (!events[name]) {
    events[name] = [];
  }
  events[name].push(callback);

  return () => (events[name] = events[name].filter((c) => c !== callback));
}

export async function start() {
  consumer = await createConsumer(
    CONSTANTS.KAFKA.TOPICS.NOTIFICATIONS.CONSUMER_GROUP,
    onMessage
  );
}

const onMessage = ({ kafkaMessage }) => {
  debug('received Kafka message: %o', kafkaMessage);
  const listeners = events[kafkaMessage.event()];
  if (!listeners) {
    debug('no listener for event %s', kafkaMessage.event());
    return;
  }
  callListeners(listeners, kafkaMessage);
};

const callListeners = (listeners, kafkaMessage) => {
  debug('%i listerners from event %s', listeners.length, kafkaMessage.event());
  listeners.forEach((callback) => {
    try {
      callback(kafkaMessage);
    } catch (e) {
      debug('callback failed for %s: %O', kafkaMessage.event(), e);
    }
  });
};
