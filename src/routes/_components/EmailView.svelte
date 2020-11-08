<script>
import EmailRecipientDisplay from "./EmailRecipientDisplay.svelte";
import EmailListItemDate from "./EmailListItemDate.svelte";
import EmailViewBody from "./EmailView/EmailViewBody.svelte";
import EmailViewShare from "./EmailView/EmailViewShare.svelte";
import EmailViewActionButton from './EmailView/EmailViewActionButton.svelte';

export let email;

$: subject = email.email.subject || 'No subject';
$: from = email.email.from[0] ||'unknown';
$: to = email.email.to || [];
$: cc = email.email.cc || [];
$: recipients = to.concat(cc);

</script>

<svelte:head>
	<title>{subject} - SoBox</title>
</svelte:head>

<div class="box email-display">
  <div class="block headers">
    <div class="subject pl-2 pb-2">
      <h4 class="title is-4  is-spaced">{subject}</h4>
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

    <div class="tags mb-0">
      <span class="tag is-white">From: </span><span class="tag"><EmailRecipientDisplay recipient='{from}'></EmailRecipientDisplay></span>
    </div>
    {#if recipients.length}
      <div class="tags">
        <span class="tag is-white">To: </span>
        {#each recipients as recipient}
          <span class="tag"><EmailRecipientDisplay recipient='{recipient}'></EmailRecipientDisplay></span>
        {/each}
      </div>
    {/if}
  </div>
  <hr class="" />
  <div class="block email-body">
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

    h2 {
      flex-grow: 1;
    }
  }
</style>
