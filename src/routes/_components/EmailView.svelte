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


export let email;

$: subject = email.email.subject || 'No subject';
$: from = email.email.from[0] ||'unknown';
$: to = email.email.to || [];
$: cc = email.email.cc || [];
$: recipients = to.concat(cc);

let floatingMenu = false;
let taskMenuCoords = [0, 0];
let selectedText = '';

const onSelection = (event) => {
  selectedText = window.getSelection ? window.getSelection().toString() : '';
  console.log('selection', selectedText, event);
  if (selectedText) {
    console.log('setting menu visible to true');
    floatingMenu = true;
    taskMenuCoords = [event.offsetX, event.offsetY];
  }
};

const onCloseMenu = (text) => {
  console.log('closing menu');
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


</script>

<svelte:head>
	<title>{subject} - SoBox</title>
</svelte:head>

<div class="box email-display">
  <div class="block headers">
    <div class="subject pl-2 pb-2">
      <div>
        <h4 class="title is-4  is-spaced">{subject}
          {#each email.labels as label (label._id)}
          <span class="pr-2 has-text-weight-normal"><Label {label} /></span>
        {/each}
        </h4>

      </div>
      <div>
        <EmailViewActionButton {email} />
      </div>
    </div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h6 class="subtitle is-6"><EmailListItemDate {email} fullDate="true" /></h6>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <EmailViewShare {email} />
        </div>
      </div>
    </div>


    <span class="tag is-white">From: </span><UserInline bgclass="has-background-white-ter" user='{from}' />
    {#if recipients.length}
      <div class="tags">
        <span class="tag is-white">To: </span>
        {#each recipients as recipient}
          <UserInline bgclass="has-background-white-ter" user='{recipient}' />
        {/each}
      </div>
    {/if}
  </div>
  <hr class="" />
  <div class="block email-body content" on:mouseup={onSelection}>
    {#if floatingMenu}
      <TaskFloatingActionMenu coords={taskMenuCoords} closeMenu={onCloseMenu} {selectedText} />      
    {/if}

    <EmailViewBody email="{email}" />
  </div>
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
