<script>
export let email;

import { afterUpdate, beforeUpdate } from 'svelte';
import { writable } from 'svelte/store';
import { getChat } from '../../../libs/chat/chatProvider';
import WorkSpaceChatMessage from './Chat/Message.svelte';

let chat = null;
let messages = writable([]);
let cancelStoreSubscription = null;
let inputValue = '';
let wrapperElement;
let autoscroll;

const keyWatcher = (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
};

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


<div class="messageWrapper" bind:this={wrapperElement}>
  <div class="messages">
    {#if !chat}
      loading
    {:else if !$messages.length}
      No message
    {:else}
      {#each $messages as message, messageIndex (message.uuid)}
      <WorkSpaceChatMessage previousMessage="{$messages[messageIndex - 1]}" {messageIndex} {message} />
      {/each}
    {/if}
  </div>
</div>
<div class="controls pr-3 pt-5">
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
.messageWrapper {
  position: relative;
  flex-grow: 1;
  overflow-y: auto;
}

.messages {
  position: absolute;
  overflow-y: auto;
  width: 100%;
}
.text-control {
  width: 100%;
}
</style>
