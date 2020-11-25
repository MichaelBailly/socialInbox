<script>
import { formatRFC7231 } from "date-fns";
import UserInline from '../../_components/User/Inline.svelte';
import TaskHumanDeadline from '../../_components/Task/HumanDeadline.svelte';
import { put } from 'api';

export let task;

const toggleDoneStatus = async () => {
  console.log('starting toggleDoneStatus');
  try {
    await put(`/api/tasks/${task.emailId}/${task._id}/done`, { done: !task.done });
  } catch(e) {
    console.log('REST err: ', e);
  }
  task.done = !task.done;
}
</script>

<div class="box">
  <div class="task-email">
    <i class="fas far fa-envelope" /> <strong>{task.emailSubject}</strong>
  </div>
  <div class="task-content">
    <div class="task-info pr-4">
      <div class="info">
        <span class="deadline" title="Deadline: {formatRFC7231(task.deadline.date)}">
          <i class="fas fa-stopwatch" />  <TaskHumanDeadline date={task.deadline.date} />
        </span>
        {#if task.creator._id !== task.assignee._id}
        <span class="creator" title="Assigned by">
          <i class="fas fa-user-nurse" /> <UserInline user={task.creator} />
        </span>
        {/if}
      </div>
      {#if task.done}
      <div class="action pt-4">
        <button class="button" on:click={toggleDoneStatus}>Re-open</button>
      </div>
      {:else}
      <div class="action pt-4">
        <button class="button" on:click={toggleDoneStatus}>Mark as done</button>
      </div>
      {/if}
    </div>
    <div class="description has-background-white-bis p-2">
      {task.description}
    </div>
  </div>
</div>

<style lang="less">
.box {
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 600px;
  flex: 1 1 auto;

  .task-content {
    display: flex;
    flex-direction: row;
    flex: 1 1 auto;
  }

  .task-info {
    display: flex;
    flex-direction: column;
  }

  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .description {
    flex: 1 1 auto;
  }
}
</style>
