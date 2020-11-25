<script>
export let userNotification;

import ActivityTemplate from './ActivityTemplate.svelte';
import UserInline from '../../User/Inline.svelte';
</script>

<ActivityTemplate {userNotification}>
  <span>
    <UserInline user={userNotification.activity.task.creator} /> created a task on email <em>{userNotification.activity.task.email.subject}</em> and assigned it to you.

  </span>
  <span slot="icon" class="icon is-medium has-text-warning">
    <i class="fas fa-lg fa-tasks"></i>
  </span>
  <span slot="title">New task <strong>{userNotification.activity.task.description}</strong></span>
</ActivityTemplate>

