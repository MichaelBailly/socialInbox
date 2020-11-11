import { store, sendEmailNotification, deliveredNotification } from './helpers';

export async function emailInitialSyncReceiver(kafkaMessage) {
  const email = kafkaMessage.payload();
  const user = kafkaMessage.sender();

  // store mail.
  // store method handles the fact that it's a insert or an update
  const storeUpdated = await store(user, email);

  if (!storeUpdated) {
    return;
  }

  const notificationPayload = deliveredNotification(email, user, true);
  await sendEmailNotification(user, notificationPayload);
}

export const EVENTS = {
  'email:initial-sync': emailInitialSyncReceiver,
};
