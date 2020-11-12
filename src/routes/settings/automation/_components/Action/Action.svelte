<script>
export let actionId;
export let action = {
  processor: null,
  value: null,
};

import { createEventDispatcher } from 'svelte';
import ActionLabel from './ActionLabel.svelte';
import ActionShare from './ActionShare.svelte';

const actionHash = {
  label: ActionLabel,
  share: ActionShare,
};

const dispatch = createEventDispatcher();

const notify = () => {
  dispatch('action', { ...action, id: actionId });
};

const onSet = (event) => {
  action = { ...action, value: event.detail };
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
            <select bind:value={action.processor} on:change={notify}>
              <option value="">...</option>
              <option value="label">add label...</option>
              <option value="share">share with...</option>
            </select>
        </div>
      </div>
    </div>
  </div>
</div>
<svelte:component this={actionHash[action.processor]} value={action.value} on:set={onSet} />
