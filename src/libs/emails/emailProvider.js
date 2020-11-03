import { writable } from 'svelte/store';
import { get, testFetch } from 'api';

export const endpoint = '/api/emails';

export const isLoading = writable(false);
export const error = writable(null);

export const isAddingUser = writable(false);
export const errorAddingUser = writable(false);

export const emails = writable([]);

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

export const fetchEmails = async() => {
  if (!testFetch()) {
    return;
  }
  requestEmails();

  try {
    const emailResponse = await get(endpoint);
    console.log('setting emails to', emailResponse.emails, emailResponse);
    receiveEmailSuccess(emailResponse.emails);
  } catch (e) {
    receiveEmailsError(e);
  }
};
