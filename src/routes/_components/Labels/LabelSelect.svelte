<script>
export let labelIds;
export let onYes;
export let onCancel;

const selectedIds = [...labelIds];
import { labels } from '../../../libs/labels/labelProvider';
import Label from './Label.svelte';

const toggle = (label) => {
  if (selectedIds.includes(label._id)) {
    selectedIds = selectedIds.map(id => id !== label._id);
  } else {
    selectedIds = [ ...selectedIds, label._id ];
  }
}

</script>
<article class="message">
  <div class="message-header">
    <p>Set / Unset labels</p>
    <button class="delete" aria-label="delete"></button>
  </div>
  <div class="message-body">
    <div>
    {#each $labels as label (label._id)}
    <div class:selected="{() => selectedIds.includes(label._id)}">
      <Label {label} />
    </div>
    {/each}
    </div>
  </div>
</article>
