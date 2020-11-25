<script>
export let userNotification;

import EmailTaskCreated from './EmailTaskCreated.svelte';
import EmailShared from './EmailShared.svelte';

const compMap = {
  'email:task:created': EmailTaskCreated,
  'email:share': EmailShared,
};

</script>

<svelte:component this="{compMap[userNotification.activity.name]}" {userNotification} />
