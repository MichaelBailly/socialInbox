<script>

export let email;
export let emailpath;

import { isAfter } from 'date-fns';
import { user } from '../../../../libs/users';
import { goto } from '@sapper/app';
import Task from '../../../../shared/task';
import EmailView from '../../../_components/EmailView.svelte';
import TaskBox from '../../../_components/Task/Box.svelte';

let showLateTasks = true;
let showDoneTasks = false;
let participation = 'all';

let tasks;

$: {
  let date = new Date();
  tasks = email.tasks
    .map(t => ({...Task.fromObject(t), emailSubject: email.email.subject}))
    .filter(t => {
      if (!showLateTasks && isAfter(date, t.deadline.date)) {
        return false;
      }
      if (!showDoneTasks && t.done) {
        return false;
      }

      if (participation === 'creator') {
        if (t.creator._id !== $user._id) {
          return false;
        }
      }

      if (participation === 'assignee') {
        if (t.assignee._id !== $user._id) {
          return false;
        }
      }

      if (participation === 'involved') {
        if (t.creator._id !== $user._id && t.assignee._id !== $user._id) {
          return false;
        }
      }

      if (participation === 'notInvolved') {
        if (t.creator._id === $user._id || t.assignee._id === $user._id) {
          return false;
        }
      }

      return true;
    })
    .sort((t1, t2) => isAfter(t2.deadline.date, t1.deadline.date));
};

const goBack = () => {
  goto(emailpath);
};
</script>

<section class="has-background-light px-6 py-2">
  <div class="email-container">
    <div class="controls">
      <button class="button is-light" on:click={goBack}>
        <span class="icon">
          <i class="fas fa-chevron-left" />
        </span>
      </button>
    </div>
    <div class="email">
      <EmailView {email} showActionMenu={false} showShareMenu={false} headOnly={true} />
    </div>
  </div>

  <div class="block has-background-white mt-6 mb-4 p-2">
    <div class="field is-horizontal">
      <div class="field-body">
        <span class="icon tasks-icon pr-3">
          <i class="fas fa-tasks" />
        </span>
        <div class="field is-narrow">
          <div class="control">
            <div class="select is-primary is-warning">
              <select bind:value={participation}>
                <option value="all">All</option>
                <option value="creator">I'm creator</option>
                <option value="assignee">I'm assignee</option>
                <option value="involved">I'm creator or assignee</option>
                <option value="notInvolved">I'm not involved</option>
              </select>
            </div>
          </div>
        </div>
        <div class="field is-narrow">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" bind:checked={showLateTasks} class="is-warning">
              show late tasks
            </label>
          </div>
        </div>

        <div class="field is-narrow">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" bind:checked={showDoneTasks}>
              show done tasks
            </label>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div class="tasks pt-4">
    {#each tasks as task}
      <TaskBox {task} showEmailSubject={false} />
    {/each}
  </div>

</section>

<style lang="less">
  section {
    flex: 1 0 auto;
    width: 100%;

    .controls > button {
      transform: translateX(-1.5rem);
    }

    .email-container {
      display: flex;
      flex-direction: row;

      .email {
        flex-grow: 1;
      }

      .controls {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }

    .field-body {
      align-items: center;
    }

    .block {
      tasks-icon {

      }
    }

    .tasks {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-evenly;
    }
  }
</style>
