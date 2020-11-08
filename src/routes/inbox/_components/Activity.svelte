<script>
export let item;
export let email;
export let previousItem;

import WorkSpaceActivityEmailShared from './Activity/EmailShared.svelte';
import WorkSpaceActivityChatStarted from './Activity/ChatStarted.svelte';

const compMap = {
  'email:share': WorkSpaceActivityEmailShared,
  'chat:started': WorkSpaceActivityChatStarted,
};



</script>

<svelte:component this="{compMap[item.name]}" {email} activity="{item}" />
