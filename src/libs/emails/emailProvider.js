import { writable, derived } from 'svelte/store';
import { user } from '../users';
import { get, testFetch } from 'api';
import { registerEvent } from '../sse';

export const endpoint = '/api/emails';

export const isLoading = writable(false);
export const error = writable(null);

export const isAddingUser = writable(false);
export const errorAddingUser = writable(false);

export const emails = writable([]);

export const myEmails = derived([user, emails], ([$user, $emails]) =>
  $user._id ? $emails.filter((m) => m.users.includes($user._id)) : []
);

export const sharedEmails = derived([user, emails], ([$user, $emails]) =>
  $user._id ? $emails.filter((m) => m.usersShared.includes($user._id)) : []
);

export const requestEmails = () => isLoading.set(true);
export const receiveEmailSuccess = (data) => {
  // Do any needed data transformation to the received payload here
  emails.set(data);
  isLoading.set(false);
};

export const receiveEmailsError = (error) => {
  // handle error
  error.set(error);
  isLoading.set(false);
};

export const fetchEmails = async () => {
  if (!testFetch()) {
    return;
  }
  requestEmails();

  try {
    const emailResponse = await get(endpoint);
    receiveEmailSuccess(emailResponse.emails);
  } catch (e) {
    receiveEmailsError(e);
  }
};

const insertEmail = (email) => {
  emails.update((list) => {
    const newList = [...list];
    const index = newList.findIndex((e) => e._id === email._id);
    if (index < 0) {
      // new email

      //  find the most recent older mail
      const nts = new Date(email.lastModified).getTime();
      const tindex = newList.findIndex((email) => {
        return new Date(email.lastModified).getTime() < nts;
      });

      // insert the new email at that position
      newList.splice(tindex, 0, email);
    } else {
      newList[index] = email;
    }

    return newList;
  });
};

registerEvent('email:shared', async (payload) => {
  let email;
  try {
    const data = await get(`/api/emails/${payload.emailId}`);
    email = data.email;
  } catch (e) {
    console.log('Error: unable to fetch email', payload.emailId, payload);
    return;
  }

  insertEmail(email);
});

registerEvent('email:label:added', async (payload) => {
  emails.update((list) => {
    const newList = list.map((email) => {
      if (payload.emailId === email._id) {
        const newMail = { ...email };
        newMail.labels.push(payload.label);
        return newMail;
      }
      return email;
    });

    return newList;
  });
});

registerEvent('email:label:removed', async (payload) => {
  emails.update((list) => {
    const newList = list.map((email) => {
      if (payload.emailId === email._id) {
        const newMail = { ...email };
        newMail.labels = newMail.labels.filter(
          (l) => l._id !== payload.label._id
        );
        return newMail;
      }
      return email;
    });

    return newList;
  });
});

registerEvent('email:delivered', async (payload) => {
  insertEmail(payload.email);
});
