<script>
import { goto } from '@sapper/app';
import EmailRecipientDisplay from './EmailRecipientDisplay.svelte';
import ListItemAvatar from './ListItemAvatar.svelte';
import EmailListItemDate from './EmailListItemDate.svelte';
import Label from './Labels/Label.svelte';
import { chatStates } from '../../libs/chat/chatProvider';
import TaskAddButtom from './Task/AddButton.svelte';

export let email;
export let baseHref;
export let selected;

$: from = email.email.from[0] ||'unknown';
$: subject = email.email.subject ||'No subject';
$: chatState = $chatStates[email._id] ||{};

const onClick = () => {
  goto(`${baseHref}/${email._id}`);
};
</script>
<div class="columns mail-item px-2 py-2" on:click={onClick} class:selected={selected}>
  <div class="avatar pr-2"><ListItemAvatar resource="{from}" size="64"></ListItemAvatar></div>
  <div class="contents">
    <div class="head">
      <div class="from is-size-6 is-uppercase has-text-weight-bold has-text-grey-light"><EmailRecipientDisplay recipient='{from}'></EmailRecipientDisplay></div>
      <div class="is-size-6 has-text-weight-light"><EmailListItemDate email="{email}"></EmailListItemDate></div>
    </div>
    <div class="subject is-size-6 has-text-weight-bold">{subject}</div>
    <div class="body-preview is-size-7">{email.email.preview || ''}</div>
    <div class="collaborative-container">
      <div class="labels">
        {#each email.labels as label}
          <span class="pr-2">
            <Label {label} />
          </span>
        {/each}
      </div>
      <div class="chat-status is-size-7 {chatState.unreadCount ? 'has-text-primary' : ''}">
        {#if chatState.total}
          {#if chatState.unreadCount}
            {chatState.unreadCount}
          {/if}
          <span class="icon">
            <i class="fas fa-comments"></i>
          </span>
        {/if}
      </div>
    </div>
  </div>
  <div class="actions p-2 has-text-right">
    <TaskAddButtom {email} />
  </div>
</div>

<style>

.body-preview {
  flex-grow: 1;
}
.mail-item {
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
}

.mail-item.selected {
  background-color: #e8f2fd;
}
.avatar {
  flex-shrink: 0;
}

.contents {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.head{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.body-preview {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.subject {
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.collaborative-container {
  display: flex;
  flex-direction: row;
}

.labels {
  flex-grow: 1;
}

.actions {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(250,250,250,0.85);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.2s ease 0.2s;
}

.mail-item:hover .actions {
  transform: scaleY(1);
  transition: transform 0.2s ease 1s;
}

</style>
