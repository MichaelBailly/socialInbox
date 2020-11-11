<script>
import { createEventDispatcher } from 'svelte';

let value;

const dispatch = createEventDispatcher();

const notify = () => {
  dispatch('input', value);
};
</script>

<div class="field is-horizontal">
  <div class="field-label is-normal">
    <label class="label">Title matches</label>
  </div>
  <div class="field-body">
    <div class="field is-expanded">
      <p class="control">
        <input class="input" type="text" bind:value placeholder="enter string to match on email's title" on:input={notify}>
      </p>
    </div>
  </div>
</div>
