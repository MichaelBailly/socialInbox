<script>
export let email;
export let onCreate;

import Select from 'svelte-select';
import  { user, getDisplayName } from '../../../libs/users';
import { get } from 'api';

export let selectedUser = { ...$user };
export let deadlineCount = 2;
export let deadlineScale = 'day';
export let description = '';


let selectedValue = { ...selectedUser, dn: getDisplayName(selectedUser) } ;

// ------------------ SELECT SPECIFIC VARIABLES
const optionIdentifier = '_id';

const getOptionLabel = (option) => option.dn;
const getSelectionLabel = (option) => option.dn;
const noOptionsMessage = 'No user';

const loadOptions = async (q) => {
  if (!q || q.length < 3) {
    return Promise.resolve([]);
  }
  const users = await get('/api/users', null, { qs: { q } });
  const result = users.map(u => {
    u.dn = getDisplayName(u);
    return u;
  });
  console.log(result);
  return result;
};
// ---------------------------------------------

$: canBeRecorded = selectedUser && selectedUser._id && description && description.length;

</script>

<article class="message is-warning">
  <div class="message-header">
    <p>Add Task</p>
    <button class="delete" aria-label="delete"></button>
  </div>
  <div class="message-body">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">
          Owner
        </label>
      </div>
      <div class="field-body">
        <div class="control is-expanded">
          <Select {loadOptions} {optionIdentifier} {getOptionLabel} {getSelectionLabel} {noOptionsMessage} bind:selectedValue placeholder="Choose user..." />
        </div>
      </div>
    </div>
    <div class="field is-horizontal has-addons is-narrow">
      <div class="field-label is-normal">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">
          Deadline: in
        </label>
      </div>
      <div class="field-body">
        <div class="field has-addons">
          <div class="control  is-narrow">
            <button class="button" disabled={deadlineCount === 1} on:click={() => deadlineCount--}>-</button>
          </div>
          <div class="control is-narrow">
            <input class="input deadline-days" type="number" bind:value={deadlineCount}>
          </div>
          <div class="control is-narrow">
            <div class="select">
              <select class="select" selected={deadlineScale}>
                <option value="hour">hours(s)</option>
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
              </select>
            </div>
          </div>
          <div class="control is-narrow">
            <button class="button" on:click={() => deadlineCount++}>+</button>
          </div>
        </div>
      </div>
    </div>
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Task</label>
      <div class="control">
        <textarea class="textarea" placeholder="Task description" bind:value={description}></textarea>
      </div>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-link" disabled={!canBeRecorded}>Save</button>
      </div>
      <div class="control">
        <button class="button is-link is-light">Cancel</button>
      </div>
    </div>
  </div>
</article>

<style>
.deadline-days {
  width: 5rem;
}
</style>
