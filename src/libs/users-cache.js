import { writable } from 'svelte/store';
import { get } from 'api';

export const cache = {};
export const cacheStore = writable({});

const USER_SOURCE_LOCAL = 'local';
const USER_SOURCE_SERVER = 'server';
const SERVER_UPDATE_INTERVAL = 60 * 60 * 1000;

export const updateCache = async (user) => {
  if (!user.email) {
    return;
  }
  const now = Date.now();
  const userToStore = { user };
  const storeUser = cache[user.email];

  // check if we should update store
  if (storeUser && storeUser.lastUpdate + SERVER_UPDATE_INTERVAL > now) {
    if (storeUser.source === USER_SOURCE_LOCAL) {
      userToStore.source = USER_SOURCE_LOCAL;
      userToStore.lastUpdate = storeUser.lastUpdate;
      updateStoreFromLocal(userToStore);
    }
    return;
  }

  userToStore.lastUpdate = now;

  if (!storeUser) {
    // we need to update cache right now with local user
    updateStoreFromLocal({ ...userToStore, user, source: USER_SOURCE_LOCAL });
  }

  const userFromDb = await get('/api/users', null, {
    qs: { email: user.email },
  });

  if (!userFromDb) {
    userToStore.source = USER_SOURCE_LOCAL;
  } else {
    userToStore.user = userFromDb;
    userToStore.source = USER_SOURCE_SERVER;
    updateStoreFromDb(userToStore);
  }

  cache[userToStore.user.email] = userToStore;
  updateCacheStore();
};

const updateStoreFromLocal = (userToStore) => {
  let cachedUserEntry = cache[userToStore.user.email] || { user: {} };

  userToStore.user = { ...cachedUserEntry.user, ...userToStore.user };
  userToStore.user.dn = getDisplayName(userToStore.user);
  cache[userToStore.user.email] = userToStore;
  updateCacheStore();
};

const updateStoreFromDb = (userToStore) => {
  cache[userToStore.user.email] = userToStore;
  cache[userToStore.user.email].user.dn = getDisplayName(
    cache[userToStore.user.email].user
  );
  updateCacheStore();
};

const updateCacheStore = () => {
  const cacheData = {};
  Object.keys(cache).forEach((k) => (cacheData[k] = cache[k].user));
  cacheStore.set({ ...cacheData });
};

export function getDisplayName(user) {
  if (user.displayName) {
    return user.displayName;
  }
  if (user.firstname) {
    if (user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    return user.firstname;
  }
  if (user.lastname) {
    return user.lastname;
  }
  if (user.name) {
    return user.name;
  }
  return user.email;
}
