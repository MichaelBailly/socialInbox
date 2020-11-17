<script>

import { goto, stores } from '@sapper/app';
import { emails, myEmails, sharedEmails } from "../../../libs/emails/emailProvider";
import Activity from "../_components/Activity.svelte";

const baseUrl = '/inbox/all/';
const { page } = stores();

const viewMail = (id) => {
  goto(`${baseUrl}${id}`);
}

let activeEmails;
let activities = [];

$: {
  if ($page.params.folder === 'shared') {
    activeEmails = sharedEmails;
  } else if ($page.params.folder === 'my') {
    activeEmails = myEmails;
  } else {
    activeEmails = emails;
  }

  activities = [];
  $activeEmails.forEach((email) => {
    activities = activities.concat(email.activity.map(a => ({...a, email})));
  });
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
</script>

{#if !activities.length}
<div class="center-all">
  <div>
    <span class="icon has-text-info">
      <i class="icon is-large far fa-3x fa-folder"></i>
    </span>
  </div>
  <div>
    <span class="has-text-info">
      Select an email from the list to have it displayed
    </span>
  </div>
</div>
{:else}
<div class="activity-container px-5">
  {#each activities as item, index}
    {#if (!activities[index-1] || activities[index-1].email._id !== item.email._id)}
    <div class="title is-5 my-4 is-clickable"  on:click={() => viewMail(item.email._id)}>
      {item.email.email.subject}
    </div>
    {/if}
    <div class="pl-3 is-clickable" on:click={() => viewMail(item.email._id)}>
      <Activity {item} email={item.email} />
    </div>
  {/each}
</div>
{/if}

<style>
.center-all {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

activity-container {

}
</style>
