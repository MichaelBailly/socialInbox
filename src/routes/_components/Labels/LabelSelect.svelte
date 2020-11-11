<script>
export let labelIds;
export let onYes;
export let onCancel;

import LabelSelectField from './LabelSelectField.svelte';

let selectedIds = [...labelIds];
let labelStr = '';

const onValue = (event) => {
  selectedIds = event.detail.map(l => l._id);
}

const validate = () => {
  onYes(selectedIds);
}

</script>
<nav class="panel">
  <p class="panel-heading">
    Set / Unset labels
  </p>
  <div class="panel-block">
    <p class="control has-icons-left">
      <input class="input" type="text" placeholder="Filter" bind:value={labelStr}>
      <span class="icon is-left">
        <i class="fas fa-search" aria-hidden="true"></i>
      </span>
    </p>
  </div>
  <div class="labels-container">
    <LabelSelectField labelIds={labelIds} {labelStr} on:labels={onValue} />
  </div>
  <div class="panel-block">
    <div class="field is-grouped">
      <p class="control">
        <button class="button is-outlined" on:click={onCancel}>
          Cancel
        </button>
      </p>
      <p class="control">
        <button class="button is-link" on:click={validate}>
          Save
        </button>
      </p>
    </div>

  </div>
</nav>

<style lang="less">
nav {
  height: 25rem;
  display: flex;
  flex-direction: column;

  .labels-container {
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>
