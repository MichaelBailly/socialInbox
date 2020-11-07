import { writable, derived } from 'svelte/store';
import { get, post } from 'api';
import { v4 as uuidv4 } from 'uuid';
import { user, getDisplayName } from '../users';
import { registerEvent } from '../sse';
import { emails } from '../emails/emailProvider';

const chats = {};

let localUser;
user.subscribe((user) => (localUser = user));

export function getChat(id) {
  if (!id) {
    throw new Error('id can not be falsy');
  }
  if (!chats[id]) {
    chats[id] = new Chat(id);
    chats[id].registerSSEListener();
  }
  return [chats[id], chats[id].messages];
}

class Chat {
  constructor(id) {
    this.id = id;
    const a = writable([]);
    const b = writable([]);
    this.serverMessages = a;
    this.pendingMessages = b;
    const messages = derived([a, b], ([$a, $b]) => [...$a, ...$b]);
    this.messages = messages;
    this._offset = 0;
  }

  async loadPrevious() {
    if (this._offset) {
      return;
    }
    this._offset = this._offset + 1;
    const previous = await get(`/api/chatmessages/${this.id}`);

    if (!previous.length) {
      return;
    }
    this.serverMessages.update((list) => [...previous.reverse(), ...list]);
  }

  async send(message) {
    const uuid = uuidv4();
    const body = {
      _id: uuid,
      uuid,
      date: new Date(),
      body: message,
      user: {
        _id: localUser._id,
        displayName: getDisplayName(localUser),
        email: localUser.email,
      },
    };
    this.pendingMessages.update((messages) => [
      ...messages,
      { ...body, pending: true },
    ]);
    const sent = await post(`/api/chatmessages/${this.id}`, body);
  }

  _addInServerMessages(message) {
    const ts = new Date(message.date).getTime();
    this.serverMessages.update((messages) => {
      let index = 0;
      for (let i = messages.length - 1; i >= 0; i--) {
        const md = new Date(messages[i].date).getTime();
        if (md < ts) {
          index = i + 1;
          break;
        }
      }
      const result = [...messages];
      result.splice(index, 0, message);
      return result;
    });
  }

  registerSSEListener() {
    registerEvent('chat:message:posted', (payload) => {
      this.pendingMessages.update((messages) =>
        messages.filter((m) => m.uuid !== payload.uuid)
      );
      this._addInServerMessages(payload);
    });
  }
}

registerEvent('chat:started', async (payload) => {
  let email;
  try {
    const data = await get(`/api/emails/${payload.emailId}`);
    email = data.email;
  } catch (e) {
    console.log('Error: unable to fetch email', payload.emailId, payload);
    return;
  }

  emails.update((list) => {
    const newList = [...list];
    const index = list.findIndex((e) => e._id === payload.emailId);
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
});
