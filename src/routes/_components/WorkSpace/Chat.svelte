<script>
export let email;

import {onMount} from 'svelte';
import {writable} from 'svelte/store';
import { getChat } from '../../../libs/chat/chatProvider';
import WorkSpaceChatMessage from './Chat/Message.svelte';

let chat = null;
let serverMessages = writable([]);
let inputValue = '';
let pendingMessages = [];

$: messages = [...$serverMessages, ...pendingMessages];

$: {
  console.log('messages', messages);
  console.log('$serverMessages', $serverMessages);
}

onMount(async () => {
  const [chatInstance, store] = getChat(email._id);
  store.subscribe(value => serverMessages.set(value));
  await chatInstance.loadPrevious();
  chat = chatInstance;
});

const sendMessage = async () => {
  if (!inputValue || !inputValue.length) {
    return;
  }
  try {
    await chat.send(inputValue);
  }catch (e) {
    console.log('failed to send chat message:' , e);
  }
}
</script>


<div class="messageWrapper">
  <div class="messages">
    {#if !chat}
    loading
    {:else if !messages.length}
    No message
    {:else}
      {#each messages as message, messageIndex (message._id)}
      <WorkSpaceChatMessage {messages} {messageIndex} {message} />
      {/each}
    {/if}
  </div>
</div>
<div class="controls pr-3 pt-5">
  <div class="field has-addons">
    <p class="control text-control">
      <input type="text" class="input is-primary" bind:value={inputValue} placeholder="Enter message...">
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
}
.text-control {
  width: 100%;
}
</style>
