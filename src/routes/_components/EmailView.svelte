<script>
import EmailRecipientDisplay from "./EmailRecipientDisplay.svelte";
import EmailListItemDate from "./EmailListItemDate.svelte";
import EmailViewBody from "./EmailViewBody.svelte";
import EmailViewShare from "./EmailView/EmailViewShare.svelte";

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
    </div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h6 class="subtitle is-6"><EmailListItemDate email="{email}" fullDate="true" /></h6>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <EmailViewShare email="{email}" />
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

<style>
  .email-display {
    width: 50%;
  }
</style>
