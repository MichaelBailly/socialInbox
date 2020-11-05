import { writable, readable } from 'svelte/store';
import { get, post } from 'api';
import { v4 as uuidv4 } from 'uuid';

const chats = {};

export function getChat(id) {
  if (!id) {
    throw new Error('id can not be falsy');
  }
  if (!chats[id]) {
    chats[id] = new Chat(id);
  }
  return [chats[id], chats[id].readOnlyMessages];
}

class Chat {
  constructor(id) {
    this.id = id;
    this.messages = writable([]);
    this.readOnlyMessages = readable([], (set) => {
      this.messages.subscribe(set);
    });
  }

  async loadPrevious() {
    const previous = await get(`/api/chatmessages/${this.id}`);
    if (!previous.length) {
      return;
    }
    this.messages.update((list) => [...previous.reverse(), ...list]);
  }

  async send(message) {
    const body = {
      uuid: uuidv4(),
      date: new Date(),
      body: message,
    };
    console.log('SEND MESSAGE:', body);
    const sent = await post(`/api/chatmessages/${this.id}`, body);
    console.log('SENT MESSAGE RESPONSE:', sent);
  }
}
