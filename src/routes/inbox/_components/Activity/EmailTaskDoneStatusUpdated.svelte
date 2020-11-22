<script>
  export let activity;

  import { user } from '../../../../libs/users';
  import ActivityTemplate from './ActivityTemplate.svelte';
  import UserInline from '../../../_components/User/Inline.svelte';
  import { format } from 'date-fns';

  let description = activity.task.description.substr(0, 35);
  if (activity.task.description.length > description.length) {
    description += '...';
  }
  $: actor = activity.actor._id === $user._id;
  $: isMe =actor._id === $user._id;
  $: deadline = format(new Date(activity.task.deadline.date), 'PPPP \'at\' HH\'h\'')
  </script>

  <ActivityTemplate date="{activity.date}">
  {#if actor}
    You
  {:else}
    <UserInline user={activity.actor} />
  {/if}
  {#if activity.task.done}
    completed the task
  {:else}
    re-opened the task
  {/if}
   <strong>"{description}"</strong>.

   <span slot="icon" class="icon is-medium has-text-warning">
    <i class="fas fa-lg fa-tasks"></i>
  </span>
  </ActivityTemplate>
