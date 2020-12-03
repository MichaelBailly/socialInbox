<script>
export let email;

import { afterUpdate, beforeUpdate, onMount, tick } from 'svelte';
import { writable } from 'svelte/store';
import { goto } from '@sapper/app';
import { stores } from '@sapper/app';

import { getChat, chatStates } from '../../../libs/chat/chatProvider';
import EmailView  from '../../_components/EmailView.svelte';
import ChatMessage from './ChatMessage.svelte';
import Activity from './Activity.svelte';

import Badge from '../../_components/Badge.svelte';

const fakeObserver = {
  observe() {},
  unobserve() {},
};
const { page } = stores();


let loadChat = false;
let chat;
let messages = writable([]);
let inputValue = '';
let scrollArea;
let scrollAreaObserver;
let autoscroll = {
  lastEmailId: null,
  on: false,
};
let chatState = {};
let activities = [];
let activeTasksCount = 0;

$: {
  if (loadChat && email && email._id && (!chat || chat.id !== email._id)) {
    const [chatInstance, store] = getChat(email._id);
    messages = store;
    chatMessages = [];
    chat = chatInstance;
    chatInstance.loadPrevious();
  }
};
$: if (email && email._id) chatState = $chatStates[email._id] || {};
$: if (email && email.activity) activities = email.activity.map(a => ({...a, component: Activity, ts: new Date(a.date).getTime()}));
$: chatMessages = $messages.map(m => {
  return {
    ...m,
    component: ChatMessage,
    observer: (m.ts > chatState.readTimestamp) ? scrollAreaObserver : fakeObserver
  };
});
$: stream = activities.concat(chatMessages).sort((m1, m2) => m1.ts - m2.ts);
$: if (email && email.tasks) activeTasksCount = email.tasks.filter(t => t.done).length;
$: tasks = email && email.tasks || [];

const keyWatcher = (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
};

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

const scrollAreaCallback = (entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) {
      return;
    }
    const messageData = target.getAttribute('data-o');
    if (!messageData) {
      return;
    }
    chat.onMessageVisible(messageData);
  });
};

beforeUpdate(async () => {
  autoscroll.on = scrollArea && (scrollArea.offsetHeight + scrollArea.scrollTop) > (scrollArea.scrollHeight - 20);
});

afterUpdate(() => {
  if (!email) {
    return;
  }
  if (autoscroll.lastEmailId !== email._id) {
    scrollArea.scrollTo(0, 0);
  }
  if (autoscroll.lastEmailId === email._id && autoscroll.on) {
    scrollArea.scrollTo(0, scrollArea.scrollHeight);
  }
  autoscroll.lastEmailId = email._id;
});

onMount(async () => {

  const options = {
    root: scrollArea,
    rootMargin: '0px',
    threshold: 0.8
  }

  scrollAreaObserver = new IntersectionObserver(scrollAreaCallback, options);

  scrollArea.scrollTo(0, 0);

  loadChat = true;
});
</script>
<div class="workspace has-background-light">
  <div class="scrollable px-6 my-2"  bind:this={scrollArea}>
    <EmailView {email} />
    {#each stream as item, itemIndex}
      <svelte:component this="{item.component}" {item} {scrollAreaObserver} previousItem={stream[itemIndex - 1]} {email} />
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
<div class="workspace-modules">
  <div title="Email tasks" class="tasks" on:click={() => goto(`${$page.path}/tasks`)}>
    {#if tasks.length}
      <button class="button is-warning">
        <span class="icon">
        <i class="fas fa-tasks"></i>
        </span>
      </button>
      {#if activeTasksCount}
        <div class="has-text-centered has-text-black">
          <Badge count={activeTasksCount} classname="has-background-warning has-text-black" />
        </div>
      {/if}
    {/if}
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

.workspace-modules {
  position: fixed;
  right: 20px;
  top: 50%;

  .tasks {
    display: flex;
    flex-direction: column;
  }
}

.tasks-container {
  position: absolute;
  background-color: green;
}
</style>
