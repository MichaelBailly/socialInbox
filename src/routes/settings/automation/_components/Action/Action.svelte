<script>
export let actionId;

import { createEventDispatcher } from 'svelte';
import ActionLabel from './ActionLabel.svelte';
import ActionShare from './ActionShare.svelte';

let value;
let processor;

const actionHash = {
  label: ActionLabel,
  share: ActionShare,
};

const dispatch = createEventDispatcher();

const notify = () => {
  dispatch('action', { id: actionId, processor, value });
};

const onSet = (event) => {
  value = event.detail;
  notify();
}
</script>

<div class="field is-horizontal">
  <div class="field-label is-normal">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Then...</label>
  </div>
  <div class="field-body">
    <div class="field is-expanded">
      <div class="control">
        <div class="select">
            <!-- svelte-ignore a11y-no-onchange -->
            <select bind:value={processor} on:change={notify}>
              <option value="">...</option>
              <option value="label">add label...</option>
              <option value="share">share with...</option>
            </select>
        </div>
      </div>
    </div>
  </div>
</div>
<svelte:component this={actionHash[processor]} on:set={onSet} />
