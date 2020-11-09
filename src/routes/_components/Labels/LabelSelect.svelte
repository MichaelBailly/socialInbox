<script>
export let labelIds;
export let onYes;
export let onCancel;

import { labels } from '../../../libs/labels/labelProvider';
import Label from './Label.svelte';

let selectedIds = [...labelIds];
let labelStr = '';

$: labelList = labelStr.length ? $labels.filter(l => l.name.toLowerCase().indexOf(labelStr.toLowerCase()) >= 0) : $labels;

const toggle = (label) => {
  if (selectedIds.includes(label._id)) {
    selectedIds = selectedIds.filter(id => id !== label._id);
  } else {
    selectedIds = [ ...selectedIds, label._id ];
  }
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
    {#each labelList as label (label._id)}
    <!-- svelte-ignore a11y-missing-attribute -->
    <a class="panel-block" class:selected="{selectedIds.includes(label._id)}" on:click='{() => toggle(label)}'>
      <span class="panel-icon">
        <i class="fas fa-check" aria-hidden="true"></i>
      </span>
      <Label {label} />
    </a>
    {/each}
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

a span {
  transform: scale(0);
  transition: transform ease 0.2s;
}

a.selected span {
  transform: scale(1);
}
</style>
