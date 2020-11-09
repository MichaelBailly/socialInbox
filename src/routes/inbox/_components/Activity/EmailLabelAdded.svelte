<script>
export let activity;

import { user as userStore, getDisplayName } from '../../../../libs/users';
import ActivityTemplate from './ActivityTemplate.svelte';
import Label from '../../../_components/Labels/Label.svelte';

let user = {};

userStore.subscribe((value) => user = value);

$: actor = activity.actor._id === user._id;
$: actorDisplayName = getDisplayName(activity.actor);

</script>

<ActivityTemplate date="{activity.date}">
<span>
  {#if actor}You{:else}{actorDisplayName}{/if}
  added the label <Label label={activity.label} /></span>

<span slot="icon" class="icon is-medium has-text-success">
  <i class="fas fa-lg fa-tags"></i>
</span>
</ActivityTemplate>
