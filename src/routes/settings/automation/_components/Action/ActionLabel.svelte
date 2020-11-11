<script>
import { createEventDispatcher } from 'svelte';
import LabelSelectField from '../../../../_components/Labels/LabelSelectField.svelte';

const dispatch = createEventDispatcher();
let selectedIds = [];
let labelStr = '';

const onValue = (event) => {
  selectedIds = event.detail;
  dispatch('set', selectedIds);
}
</script>
<div class="action-label">
  <LabelSelectField labelIds={[]} {labelStr} on:labels={onValue} />
</div>

<style>
.action-label {
  max-height: 10rem;
  overflow-y: auto;
}
</style>
