import logger from '../logger';
import { applyAutomations } from '../automation';
const debug = logger.extend('notifications:email:sync');

const onEmailDelivered = async ({ kafkaMessage }) => {
  debug('############# Got message %s', kafkaMessage.event());
  await applyAutomations(kafkaMessage);
};

export const NOTIFICATIONS = {
  'email:delivered': onEmailDelivered,
};
