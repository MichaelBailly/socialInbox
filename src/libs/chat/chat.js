import { writable, derived } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { get, post, put } from 'api';
import { getDisplayName } from '../users';

export class Chat {
  constructor(id, user) {
    this.id = id;
    this.user = user;
    const a = writable([]);
    const b = writable([]);
    this.serverMessages = a;
    this.pendingMessages = b;
    const messages = derived([a, b], ([$a, $b]) => [...$a, ...$b]);
    this.messages = messages;
    this._offset = 0;

    /**
     * Timestamp of the last seen message
     */
    this.lastSeen = 0;

    /**
     * The temporary place where messages having signaled their visibility is stored
     */
    this.seenTempStorage = [];
  }

  onMessageVisible(messageData) {
    this.seenTempStorage.push(messageData);
    requestIdleCallback((deadline) => this.dequeueVisibleMessages(deadline));
  }

  dequeueVisibleMessages() {
    if (!this.seenTempStorage.length) {
      return;
    }
    const seenTempStorage = [...this.seenTempStorage];
    seenTempStorage.sort();
    const latestMessage = seenTempStorage.pop().split('|');
    if (latestMessage.length !== 2) {
      return;
    }
    const messageTs = parseInt(latestMessage.shift(), 10);
    this.seenTempStorage = [];
    if (messageTs <= this.lastSeen) {
      return;
    }
    this.lastSeen = messageTs;
    console.log('last seen', this.lastSeen);
    put(`/api/chatmessages/${this.id}/lastSeen`, {
      _id: latestMessage.shift(),
    });
  }

  async loadPrevious() {
    if (this._offset) {
      return;
    }
    this._offset = this._offset + 1;
    const previous = await get(`/api/chatmessages/${this.id}`);

    if (!previous.messages.length) {
      return;
    }
    this.serverMessages.update((list) => [
      ...previous.messages
        .reverse()
        .map((m) => ({ ...m, ts: new Date(m.date).getTime() })),
      ...list,
    ]);

    if (
      previous.userData &&
      previous.userData.lastSeenMessage &&
      previous.userData.lastSeenMessage.ts
    ) {
      this.lastSeen = previous.userData.lastSeenMessage.ts;
    }
  }

  async send(message) {
    const uuid = uuidv4();
    const date = new Date();
    const body = {
      _id: uuid,
      uuid,
      date,
      ts: date.getTime(),
      body: message,
      user: {
        _id: this.user._id,
        displayName: getDisplayName(this.user),
        email: this.user.email,
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
    message.ts = ts;
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

  onSSEChatMessagePosted(payload) {
    this.pendingMessages.update((messages) =>
      messages.filter((m) => m.uuid !== payload.uuid)
    );
    this._addInServerMessages(payload);
  }

  onSSEChatMessageLastSeenPointerUpdated(payload) {
    console.log('chat: updating lastseen between', this.lastSeen, payload.ts);
    this.lastSeen = Math.max(this.lastSeen, payload.ts);
  }
}
