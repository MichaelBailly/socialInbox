<script>
export let item;
export let email;

import WorkSpaceActivityEmailShared from './Activity/EmailShared.svelte';
import WorkSpaceActivityChatStarted from './Activity/ChatStarted.svelte';
import WorkSpaceActivityEmailLabelAdded from './Activity/EmailLabelAdded.svelte';

const compMap = {
  'email:share': WorkSpaceActivityEmailShared,
  'chat:started': WorkSpaceActivityChatStarted,
  'email:label:added': WorkSpaceActivityEmailLabelAdded
};



</script>

<svelte:component this="{compMap[item.name]}" {email} activity="{item}" />
