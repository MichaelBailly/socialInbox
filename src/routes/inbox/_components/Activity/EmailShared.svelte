<script>
export let activity;

import { user as userStore, getDisplayName } from '../../../../libs/users';
import ActivityTemplate from './ActivityTemplate.svelte';
import AutomationInlineDisplay from '../../../_components/Automation/InlineDisplay.svelte';
import UserInline from '../../../_components/User/Inline.svelte';

let user = {};

userStore.subscribe((value) => user = value);

$: isActor = activity.actor._id === user._id;
$: targetDisplayName = getDisplayName(activity.target);

</script>

<ActivityTemplate date="{activity.date}">
{#if activity.actor.origin === 'user'}
  {#if isActor}
  <span>You shared this email with <UserInline user={activity.target} /></span>
  {:else}
  <span>
    <UserInline user={activity.actor} /> shared this email with you
  </span>
  {/if}
{:else}
  Email shared with <em>{targetDisplayName}</em> by automation <AutomationInlineDisplay automation={activity.actor} />
{/if}
<span slot="icon" class="icon is-medium has-text-link">
  <i class="fas fa-lg fa-lock"></i>
</span>
</ActivityTemplate>
