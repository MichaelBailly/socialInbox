import { store, sendEmailNotification, deliveredNotification, emailUpdatedNotification, sendEmailUpdatedNotification, STORE_KIND_UPDATE } from './helpers';

export async function emailInitialSyncReceiver(kafkaMessage) {
  const email = kafkaMessage.payload();
  const user = kafkaMessage.sender();

  // store mail.
  // store method handles the fact that it's a insert or an update
  const [updateKind, updatedEmail] = await store(user, email);

  if (!updateKind) {
    return;
  }

  const notificationPayload = deliveredNotification(updatedEmail, user, true);
  await sendEmailNotification(user, notificationPayload);

  if (updateKind === STORE_KIND_UPDATE) {
    const updateNotificationPayload = emailUpdatedNotification(updatedEmail, user);
    await sendEmailUpdatedNotification(user, updateNotificationPayload);
  }
}

export const EVENTS = {
  'email:initial-sync': emailInitialSyncReceiver,
};
