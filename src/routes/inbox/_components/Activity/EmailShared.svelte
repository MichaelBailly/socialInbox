<script>
export let email;
export let activity;

import { user as userStore, getDisplayName } from '../../../../libs/users';
import ActivityTemplate from './ActivityTemplate.svelte';

let user = {};

userStore.subscribe((value) => user = value);

$: actor = activity.actor._id === user._id;
$: actorDisplayName = getDisplayName(activity.actor);
$: targetDisplayName = getDisplayName(activity.target);

</script>

<ActivityTemplate date="{activity.date}">
{#if actor}
<span>You shared the mail <strong>{email.email.subject}</strong> with <em>{targetDisplayName}</em></span>
{:else}
<div>
  {actorDisplayName} shared the mail <strong>{email.email.subject}</strong> with you
</div>
{/if}
<span slot="icon" class="icon is-medium has-text-link">
  <i class="fas fa-lg fa-lock"></i>
</span>
</ActivityTemplate>
