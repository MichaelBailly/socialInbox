<script>
export let email;
export let onCreate;
export let onCancel;

import Select from 'svelte-select';
import  { user, getDisplayName } from '../../../libs/users';
import { get, post } from 'api';
import { add, format } from 'date-fns';

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
  return result;
};
// ---------------------------------------------

let deadlineDateString;

$: deadlineDate = add(new Date(), {
    weeks: deadlineScale === 'week' && deadlineCount || 0,
    days: deadlineScale === 'day' && deadlineCount || 0,
    hours: deadlineScale === 'hour' && deadlineCount || 0,
  });
$: deadlineDateString = format(deadlineDate, 'PPPP \'at\' HH\'h\'');

$: selectedValue && console.log(selectedValue);

$: canBeRecorded = selectedValue && selectedValue._id && description && description.length;

const create = async () => {
  if (!canBeRecorded) {
    return;
  }

  await createTask({
    assignee: selectedValue,
    deadline: {
      date: deadlineDate,
      count: deadlineCount,
      scale: deadlineScale,
    },
    description,
  });

  return onCreate();
}

const createTask = async (task) => {
  let id;
  try {
    const response = await post(`/api/tasks/${email._id}`, task);
    id = response._id;
  } catch(e) {
    console.log('Unable to create task', e);
  }
};

</script>

<article class="message is-warning">
  <div class="message-header">
    <p>Add Task</p>
    <button class="delete" aria-label="delete" on:click={onCancel}></button>
  </div>
  <div class="message-body">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">
          Assignee
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
              <select class="select" bind:value={deadlineScale}>
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
    <p class="help pb-2">Deadline set to {deadlineDateString}</p>
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Task</label>
      <div class="control">
        <textarea class="textarea" placeholder="Task description" bind:value={description}></textarea>
      </div>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-link" disabled={!canBeRecorded} on:click={create}>Save</button>
      </div>
      <div class="control">
        <button class="button is-link is-light" on:click={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
</article>

<style>
.deadline-days {
  width: 5rem;
}

.is-expanded {
  width: 100%;
}
</style>
