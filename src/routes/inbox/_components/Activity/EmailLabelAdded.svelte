<script>
export let activity;

import { user as userStore, getDisplayName } from '../../../../libs/users';
import ActivityTemplate from './ActivityTemplate.svelte';
import Label from '../../../_components/Labels/Label.svelte';
import AutomationInlineDisplay from '../../../_components/Automation/InlineDisplay.svelte';

let user = {};

userStore.subscribe((value) => user = value);

$: actor = activity.actor._id === user._id;
$: actorDisplayName = getDisplayName(activity.actor);

</script>

<ActivityTemplate date="{activity.date}">
<span>
  {#if activity.actor.origin === 'user'}
    {#if actor}You{:else}{actorDisplayName}{/if}
    added the label <Label label={activity.label} />
  {:else}
  Label <Label label={activity.label} /> added by automation <AutomationInlineDisplay automation={activity.actor} />
  {/if}
</span>

<span slot="icon" class="icon is-medium has-text-success">
  <i class="fas fa-lg fa-tags"></i>
</span>
</ActivityTemplate>
