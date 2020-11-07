<script>

export let email;

import WorkSpaceActivityEmailShared from './Activity/EmailShared.svelte';
import WorkSpaceActivityChatStarted from './Activity/ChatStarted.svelte';

const compMap = {
  'email:share': WorkSpaceActivityEmailShared,
  'chat:started': WorkSpaceActivityChatStarted,
}

$: sortedActivities = [...email.activity].sort((a1, a2) => new Date(a2.date).getTime() - new Date(a1.date).getTime());

</script>
<div class="container">
{#each sortedActivities as activity}

  <svelte:component this="{compMap[activity.name]}" {email} {activity} />

{:else}
<div class="no-activity container is-justify-content-center is-align-items-center has-text-centered px-6">
  <div>
    <p>
      No activity yet.
    </p>
    <p>
      Try to <em>share an email</em> with people in your team !
    </p>
  </div>
</div>
{/each}
</div>
<style lang="less">
  .no-activity {
    display: flex;
  }
</style>
