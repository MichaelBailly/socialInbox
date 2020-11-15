<script>
export let activity;

import { user } from '../../../../libs/users';
import ActivityTemplate from './ActivityTemplate.svelte';
import UserInline from '../../../_components/User/Inline.svelte';
import { format } from 'date-fns';

$: actor = activity.actor._id === $user._id;
$: assignee = activity.target._id === $user._id;
$: actorIsAssignee = activity.actor._id === activity.target._id;
$: deadline = format(new Date(activity.task.deadline.date), 'PPPP \'at\' HH\'h\'')
</script>

<ActivityTemplate date="{activity.date}">
{#if actor}
  You
{:else}
  <UserInline user={activity.actor} />
{/if}
created a task to complete on {deadline}
{#if !actorIsAssignee}
  {#if assignee}
    by you.
  {:else}
    by <UserInline user={activity.target} />.
  {/if}
{/if}
<span slot="icon" class="icon is-medium has-text-warning">
  <i class="fas fa-lg fa-tasks"></i>
</span>
</ActivityTemplate>
