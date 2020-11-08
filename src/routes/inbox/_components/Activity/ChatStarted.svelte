<script>
export let email;
export let activity;

import { user as userStore, getDisplayName } from '../../../../libs/users';
import ActivityTemplate from './ActivityTemplate.svelte';


let user = {};

userStore.subscribe((value) => user = value);

$: actor = activity.actor._id === user._id;
$: actorDisplayName = getDisplayName(activity.actor);
</script>

<ActivityTemplate date="{activity.date}">
{#if actor}You{:else}{actorDisplayName}{/if} started a conversation on <strong>{email.email.subject}</strong>
<span slot="icon" class="icon is-medium has-text-primary">
  <i class="fas fa-lg fa-comments"></i>
</span>
</ActivityTemplate>

