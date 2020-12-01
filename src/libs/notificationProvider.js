import { writable } from 'svelte/store';
import { get } from 'api';
import { registerEvent } from './sse';
import { isAfter } from 'date-fns';
import EmailHead from '../shared/email-head';

export const unreadNotifications = writable([]);

export const start = () => {
  const unregister = registerEvent('user:notification:created', (payload) => {
    updateStore([payload]);
  });
  const unregister2 = registerEvent('user:notifications:seen:updated', filterOutIds);
  loadFromServer();
};

const loadFromServer = async () => {
  try {
    const unreads = await get('/api/notifications');
    updateStore(unreads);
  } catch (e) {
    console.log('Error loading notifications from store:', e.message, e);
    throw e;
  }
};

const updateStore = (notifications) => {
  const toUpdate = notifications.filter(n => !n.seen);
  if (!toUpdate.length) {
    return;
  }
  unreadNotifications.update((notifs) => {
    const newStoreContents = [...notifs];

    toUpdate.forEach(n => {
      const hydratedNotif = hydrateNotification(n);
      const index = newStoreContents.findIndex(notification => hydratedNotif._id === notification._id);
      if (index >= 0) {
        newStoreContents.splice(index, 1, hydratedNotif);
      } else {
        const previousNotifIndex = newStoreContents.findIndex(notification => {
          console.log(new Date(hydratedNotif.activity.date), new Date(notification.activity.date), isAfter(new Date(hydratedNotif.activity.date), new Date(notification.activity.date)));
          return isAfter(new Date(hydratedNotif.activity.date), new Date(notification.activity.date));
        });
        if (previousNotifIndex < 0) {
          newStoreContents.push(hydratedNotif);
        } else {
          newStoreContents.splice(previousNotifIndex, 0, hydratedNotif);
        }
      }
    });

    return newStoreContents;
  });
};

const filterOutIds = (payload) => {
  const filter = n => !payload.ids.includes(n._id);
  unreadNotifications.update((notifications) => notifications.filter(filter));
};

const hydrateNotification = (n) => {
  const hydratedNotification = { ...n };
  if (hydratedNotification.email) {
    hydratedNotification.email = EmailHead.fromObject(n.email);
  }
  return hydratedNotification;
};
