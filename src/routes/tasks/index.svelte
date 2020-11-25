<script>
import { get } from 'api';
import { add, endOfMonth, endOfWeek, formatDistanceToNow, isSameMonth, isSameWeek, sub } from 'date-fns';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { lateTasks } from '../../libs/tasks/tasksProvider';
import Task from '../../shared/task';
import TaskBox from './_components/TaskBox.svelte';

const taskList = writable([]);
const sameWeekOpts = { weekStartsOn: 1 };
let nextQuery;

$: console.log($taskList, nextQuery);
$: today = new Date();
$: thisWeek = $taskList.filter(t => isSameWeek(today, t.deadline.date, sameWeekOpts));
$: laterThisMonth = $taskList.filter(t => !isSameWeek(today, t.deadline.date, sameWeekOpts) && isSameMonth(today, t.deadline.date));
//$: nextMonth = $taskList.filter(t => !isSameMonth(today, t.deadline.date));
let nextMonth = [];

onMount(async () => {
  const today = new Date();
  const lastSecondOfWeek = endOfWeek(today, sameWeekOpts);
  const sameMonth = isSameMonth(today, lastSecondOfWeek);
  let lastOfMonth;
  if (sameMonth) {
    lastOfMonth = endOfMonth(add(lastSecondOfWeek, { months: 1 }));
  } else {
    lastOfMonth = endOfMonth(lastSecondOfWeek);
  }

  const response = await get('/api/tasks', null, {
    qs: {
      to: lastOfMonth,
      from: today,
    },
  });

  taskList.set(response.tasks.map(t => ({...Task.fromObject(t), emailSubject: t.emailSubject }) ));
  nextQuery = response.next;
});

const formatDate = (date) => {
  return formatDistanceToNow(date);
};
</script>

<article>
  {#if $lateTasks.length}
  <section class="section">
    <div class="subtitle is-4">Late tasks</div>
    <div class="tasks">
      {#each $lateTasks as task}
        <TaskBox {task} />
      {/each}
    </div>
  </section>
  {/if}

  <section class="section">
    <div class="subtitle is-4">This week</div>
    {#if thisWeek.length}
    <div class="tasks">
      {#each thisWeek as task}
        <TaskBox {task} />
      {/each}
    </div>
    {:else}
    <div class="no-tasks">
      No task
    </div>
    {/if}
  </section>

  <section class="section">
    <div class="subtitle is-4">Later this month</div>
    {#if laterThisMonth.length}
    <div class="tasks">
      {#each laterThisMonth as task}
        <TaskBox {task} />
      {/each}
    </div>
    {:else}
    <div class="no-tasks">
      No task
    </div>
    {/if}
  </section>

  <section class="section">
    <div class="subtitle is-4">Next month</div>
    {#if nextMonth.length}
    <div class="tasks">
      {#each nextMonth as task}
        <TaskBox {task} />
      {/each}
    </div>
    {:else}
    <div class="no-tasks">
      No task
    </div>
    {/if}
  </section>
</article>

<style lang="less">
article {
  flex: 1 1 auto;
  overflow-y: auto;
}
.tasks {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>
