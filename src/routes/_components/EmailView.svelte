<script>
import { openModal, closeModal } from '../../libs/modal/modalService';
import EmailListItemDate from "./EmailListItemDate.svelte";
import EmailViewBody from "./EmailView/EmailViewBody.svelte";
import EmailViewShare from "./EmailView/EmailViewShare.svelte";
import EmailViewActionButton from './EmailView/EmailViewActionButton.svelte';
import Label from './Labels/Label.svelte';
import UserInline from './User/Inline.svelte';
import TaskFloatingActionMenu from './Task/FloatingActionMenu.svelte';
import TaskCreateForm from './Task/CreateForm.svelte';
import { markAsRead } from '../../libs/emails/emailProvider';
import { user } from '../../libs/users';
import { afterUpdate } from 'svelte';


export let email;
export let showActionMenu = true;
export let showShareMenu = true;
export let headOnly = false;

$: subject = email && email.email.subject || 'No subject';
$: from = email && email.email.from[0] ||'unknown';
$: to = email && email.email.to || [];
$: cc = email && email.email.cc || [];
$: recipients = to.concat(cc);
$: labels = email && email.labels || [];

let emailId;
let floatingMenu = false;
let taskMenuCoords = [0, 0];
let selectedText = '';

const onSelection = (event) => {
  selectedText = window.getSelection ? window.getSelection().toString() : '';
  if (selectedText) {
    floatingMenu = true;
    taskMenuCoords = [event.offsetX, event.offsetY];
  }
};

const onCloseMenu = (text) => {
  floatingMenu = false;
  if (text) {
    openModal()(TaskCreateForm, {
    email,
    description: text,
    onCreate: closeModal(),
    onCancel: closeModal(),
  },{
    closeButton: false
  });
  }
}

afterUpdate(() => {
  if (!email) {
    return;
  }
  if (emailId !== email._id) {
    markAsRead(email, $user._id);
  }
  emailId = email._id;
});
</script>

<svelte:head>
	<title>{subject} - SoBox</title>
</svelte:head>

<div class="box email-display">
  <div class="block headers">
    <div class="level pl-2 pb-2 mb-0">
      <div class="level-left">
        <div class="level-item">
          <h4 class="title is-4  is-spaced">{subject}
            {#each labels as label (label._id)}
            <span class="pr-2 has-text-weight-normal"><Label {label} /></span>
          {/each}
          </h4>
        </div>
      </div>
      {#if  showActionMenu}
      <div class="level-right">
        <div class="level-item">
          <EmailViewActionButton {email} />
        </div>
      </div>
      {/if}
    </div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h6 class="subtitle is-6"><UserInline bgclass="has-background-white-ter" user='{from}' /> , <EmailListItemDate {email} fullDate="true" /></h6>
        </div>
      </div>
      {#if showShareMenu}
      <div class="level-right">
        <div class="level-item is-narrow">
          <EmailViewShare {email} />
        </div>
      </div>
      {/if}
    </div>
    {#if !headOnly}
      {#if recipients.length}
        <div class="tags">
          <span class="tag is-white">To: </span>
          {#each recipients as recipient}
            <UserInline bgclass="has-background-white-ter" user='{recipient}' />
          {/each}
        </div>
      {/if}
    {/if}
  </div>
  {#if !headOnly}
  <hr class="" />
  <div class="block email-body content" on:mouseup={onSelection}>
    {#if floatingMenu}
      <TaskFloatingActionMenu coords={taskMenuCoords} closeMenu={onCloseMenu} {selectedText} />
    {/if}

    <EmailViewBody email="{email}" />
  </div>
  {/if}
</div>

<style lang="less">
  .email-display {
    flex: 0 0 50%;
  }

  .subject {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .email-body {
    position: relative;
  }
</style>
