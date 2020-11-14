import { get, post } from 'api';
import { writable } from 'svelte/store';
import { user } from '../users';
import { emails } from '../emails/emailProvider';
import { registerEvent } from '../sse';
import { Chat } from './chat';
import { ChatState } from './chat-state';

export const chatStates = writable({});

let localUser;
user.subscribe((user) => (localUser = user));

const chats = {};

export function getChat(id) {
  if (!id) {
    throw new Error('id can not be falsy');
  }
  if (!chats[id]) {
    chats[id] = new Chat(id, localUser);
  }
  return [chats[id], chats[id].messages];
}

// --- chat-states ---

const chatStatesHash = {};

const loadStates = async (emailIds) => {
  const states = await post('/api/chatmessages/states', emailIds);
  states.forEach(
    (state) =>
      (chatStatesHash[state.emailId] = new ChatState(
        state.emailId,
        localUser,
        state.lastSeen,
        state.timestamps,
        state.totalMessages
      ))
  );
  chatStates.set(chatStatesHash);
};

const removeStates = (emailIds) => {
  emailIds.forEach((id) => delete chatStatesHash[id]);
  chatStates.set(chatStatesHash);
};

emails.subscribe((emailList) => {
  const emailIds = emailList.map((e) => e._id);
  const missingStates = emailIds.filter((id) => !chatStatesHash[id]);
  loadStates(missingStates);
  const outdatedStates = Object.keys(chatStatesHash).filter(
    (id) => !emailIds.includes(id)
  );
  removeStates(outdatedStates);
});

// --- / chat-states ---

registerEvent('chat:message:posted', (payload) => {
  const chatId = payload.emailId;
  if (chats[chatId]) {
    chats[chatId].onSSEChatMessagePosted(payload);
  }
  if (chatStatesHash[chatId]) {
    chatStatesHash[chatId].onSSEChatMessagePosted(payload);
    chatStates.set(chatStatesHash);
  }
});

registerEvent('chat-message:last-seen-pointer:updated', (payload) => {
  const chatId = payload.emailId;
  if (chats[chatId]) {
    chats[chatId].onSSEChatMessageLastSeenPointerUpdated(payload);
  }
  if (chatStatesHash[chatId]) {
    chatStatesHash[chatId].onSSEChatMessageLastSeenPointerUpdated(payload);
    chatStates.set(chatStatesHash);
  }
});

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
