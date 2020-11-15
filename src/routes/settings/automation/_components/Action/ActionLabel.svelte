<script>
import { createEventDispatcher } from 'svelte';
import LabelSelectField from '../../../../_components/Labels/LabelSelectField.svelte';

const dispatch = createEventDispatcher();
export let value = [];

if (!value) {
  value = [];
}

let labelStr = '';
let labelIds = value.map(l => l._id);

const onValue = (event) => {
  value = event.detail;
  dispatch('set', value);
}
</script>
<div class="action-label">
  <LabelSelectField {labelIds} {labelStr} on:labels={onValue} />
</div>

<style>
.action-label {
  max-height: 10rem;
  overflow-y: auto;
}
</style>
