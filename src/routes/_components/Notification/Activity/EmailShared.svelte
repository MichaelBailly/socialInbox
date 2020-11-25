<script>
  export let userNotification;

  import ActivityTemplate from './ActivityTemplate.svelte';
  import UserInline from '../../User/Inline.svelte';
  </script>

  <ActivityTemplate {userNotification}>
    <span>
      <UserInline user={userNotification.activity.actor} /> shared the email <strong>{userNotification.email.subject}</strong> with you.

    </span>
    <span slot="icon" class="icon is-medium has-text-link">
      <i class="fas fa-lg fa-lock"></i>
    </span>
    <span slot="title">New shared email <strong>{userNotification.email.subject}</strong></span>
  </ActivityTemplate>

