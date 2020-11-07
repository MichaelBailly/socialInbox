import logger from '../../logger';
import onNotification from '..';

const debug = logger.extend('notifications:chat-messsage:posted');

onNotification('chat:message:posted', ({ kafkaMessage }) => {
  debug('Got message %s', kafkaMessage.event());
});
