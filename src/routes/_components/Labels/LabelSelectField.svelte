<script>
export let labelIds;
export let labelStr;

import { createEventDispatcher } from 'svelte';
import Label from './Label.svelte';
import { labels } from '../../../libs/labels/labelProvider';

const dispatch = createEventDispatcher();
const lids = labelIds || [];
let selectedIds = [...lids];

$: labelList = labelStr.length ? $labels.filter(l => l.name.toLowerCase().indexOf(labelStr.toLowerCase()) >= 0) : $labels;

const toggle = (label) => {
  if (selectedIds.includes(label._id)) {
    selectedIds = selectedIds.filter(id => id !== label._id);
  } else {
    selectedIds = [ ...selectedIds, label._id ];
  }
  notify();
}

const notify = () => {
  dispatch('labels', $labels.filter(l => selectedIds.includes(l._id)));
};
</script>

{#each labelList as label (label._id)}
<!-- svelte-ignore a11y-missing-attribute -->
<a class="panel-block" class:selected="{selectedIds.includes(label._id)}" on:click='{() => toggle(label)}'>
  <span class="panel-icon">
    <i class="fas fa-check" aria-hidden="true"></i>
  </span>
  <Label {label} />
</a>
{/each}

<style>
a span {
  transform: scale(0);
  transition: transform ease 0.2s;
}

a.selected span {
  transform: scale(1);
}
</style>
