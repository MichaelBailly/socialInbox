<script>
import { createEventDispatcher } from 'svelte';
import EmailRecipientDisplay from './EmailRecipientDisplay.svelte';
import ListItemAvatar from './ListItemAvatar.svelte';
import EmailListItemDate from './EmailListItemDate.svelte';
import Label from './Labels/Label.svelte';

export let email;

const dispatch = createEventDispatcher();

$: from = email.email.from[0] ||'unknown';
$: subject = email.email.subject ||'No subject';

</script>
<div class="columns mail-item px-2 py-4" on:click="{() => dispatch('display', email)}">
    <div class="avatar pr-2"><ListItemAvatar resource="{from}" size="64"></ListItemAvatar></div>
    <div class="contents">
      <div class="head">
        <div class="from is-size-6 is-uppercase has-text-weight-bold has-text-grey-light"><EmailRecipientDisplay recipient='{from}'></EmailRecipientDisplay></div>
        <div class="is-size-6 has-text-weight-light"><EmailListItemDate email="{email}"></EmailListItemDate></div>
      </div>
      <div class="subject is-size-6 has-text-weight-bold">{subject}</div>
      <div class="body-preview is-size-7">{email.email.preview || ''}</div>
      <div>
        {#each email.labels as label}
          <span class="pr-2">
            <Label {label} />
          </span>
        {/each}
      </div>
    </div>
</div>

<style>

.mail-item, .contents, .body-preview {
  flex-grow: 1;
}
.mail-item {
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: row;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}
.avatar {
  flex-shrink: 0;
}

.contents {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.head{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.body-preview {
  flex: 1;
  min-width: 0;

}

</style>
