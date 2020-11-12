<script>
export let automation;

import TriggerDescription from './Trigger/TriggerDescription.svelte';
import ActionDescription from './Trigger/ActionDescription.svelte';
</script>

<div>
  <div class="tite-container">
    <div class="title is-4">{automation.name}</div>
    <div><a href="/settings/automation/{automation._id}/edit">Edit</a></div>
  </div>
  <div>When <TriggerDescription trigger={automation.trigger} />, then:
  <ul>
    {#each automation.actions as action}
    <li><ActionDescription {action} /></li>
    {/each}
  </ul>
  </div>
</div>
