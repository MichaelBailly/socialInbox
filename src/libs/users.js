import { writable } from 'svelte/store';

import { getDisplayName } from './users-cache';
export {
  cacheStore as userCache,
  updateCache,
  getDisplayName,
} from './users-cache';

const user = writable({});

export { user };

export function getUserAvatar(user, size) {
  const host = new URL(window.location).origin;

  let avatarUrl;

  if (user.email) {
    const avatarSize = size || 64;
    const url = new URL('/api/avatar', host);
    url.searchParams.append('email', user.email);
    url.searchParams.append('name', getDisplayName(user));
    url.searchParams.append('size', avatarSize);
    avatarUrl = url.toString();
  } else {
    avatarUrl = '/foo';
  }

  return avatarUrl;
}
