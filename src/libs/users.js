import { writable } from 'svelte/store';

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
    url.searchParams.append('size', size);
    avatarUrl = url.toString();
  } else {
    avatarUrl = '/foo';
  }

  return avatarUrl;
}

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
  return user.email;
}
