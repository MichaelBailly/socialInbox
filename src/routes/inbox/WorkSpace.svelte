<script>
export let email;

import { afterUpdate, beforeUpdate } from 'svelte';

import { writable } from 'svelte/store';
import { getChat } from '../../libs/chat/chatProvider';

let chat;
let cancelStoreSubscription;
let messages = writable([]);

$: activities = email.activity.map(a => ({...a, component: 'Activity'}));
$: chatMessages = $messages.map(m => ({...m, component: 'ChatMessage'}));
$: stream = activities.concat(chatMessages);

const applyState =async () => {
  if (!email || !email._id) {
    return;
  } else if (chat && chat.id === email._id) {
    return;
  }

  cancelStoreSubscription && cancelStoreSubscription();
  messages.set([]);

  const [chatInstance, store] = getChat(email._id);
  cancelStoreSubscription = store.subscribe(value => messages.set(value));
  await chatInstance.loadPrevious();
  chat = chatInstance;
}

beforeUpdate(async () => {
  applyState();
});

afterUpdate(() => {
});

</script>

{#each stream as item}
  <p>
    <code>
      {JSON.stringify(item)}
    </code>
  </p>
{/each}
