<script>
export let email;

import { afterUpdate, beforeUpdate } from 'svelte';

import { writable } from 'svelte/store';
import { getChat } from '../../../libs/chat/chatProvider';
import EmailView  from '../../_components/EmailView.svelte';
import ChatMessage from './ChatMessage.svelte';
import Activity from './Activity.svelte';

let chat;
let messages = writable([]);
let cancelStoreSubscription = null;
let inputValue = '';
let wrapperElement;
let autoscroll;

$: activities = email.activity.map(a => ({...a, component: Activity, ts: new Date(a.date).getTime()}));
$: chatMessages = $messages.map(m => ({...m, component: ChatMessage, ts: new Date(m.date).getTime()}));
$: stream = activities.concat(chatMessages).sort((m1, m2) => m1.ts - m2.ts);

const keyWatcher = (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
};

const applyState = async () => {
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

const sendMessage = async () => {
  if (!inputValue || !inputValue.length) {
    return;
  }
  try {
    await chat.send(inputValue);
  } catch (e) {
    console.log('failed to send chat message:' , e);
  }
  inputValue = '';
}

beforeUpdate(async () => {
  autoscroll = wrapperElement && (wrapperElement.offsetHeight + wrapperElement.scrollTop) > (wrapperElement.scrollHeight - 20);
  applyState();
});

afterUpdate(() => {
  if (autoscroll) wrapperElement.scrollTo(0, wrapperElement.scrollHeight);
});

</script>
<div class="workspace has-background-light">
  <div class="scrollable px-6 my-2"  bind:this={wrapperElement}>
    <EmailView {email} />
    {#each stream as item, itemIndex}
      <svelte:component this="{item.component}" {item}  previousItem={stream[itemIndex - 1]} {email} />
    {/each}
  </div>
  <div class="field has-addons">
    <p class="control text-control">
      <input type="text" class="input is-primary" bind:value={inputValue} on:keypress={keyWatcher} placeholder="Enter message...">
    </p>
    <p class="control">
      <button class="button is-primary" on:click={sendMessage}>
        <span class="icon">
          <i class="fas fa-paper-plane"></i>
        </span>
      </button>
    </p>
  </div>
</div>

<style lang="less">
.workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
}

.scrollable {
  flex: 1 1 auto;
  overflow-y: auto;
}

.control.text-control {
  width: 100%;
}
</style>
