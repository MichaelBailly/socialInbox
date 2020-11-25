import { get } from 'api';
import { isAfter, isBefore, sub } from 'date-fns';
import { writable } from 'svelte/store';
import Task from '../../shared/task';
import { registerEvent } from '../sse';
import { user } from '../users';

const LATE_TASKS_INTERVAL = 10 * 60 * 1000;

export const lateTasks = writable([]);

let tasksUpdateInterval;
let currentUser = null;
let started = false;
const registeredEvents = [];

export const start = async () => {
  if (!started) {
    const unsubscribe = user.subscribe((userObject) => {
      currentUser = userObject;
    });
    registeredEvents.push(unsubscribe);
    tasksUpdateInterval = setInterval(refreshLateTasks, LATE_TASKS_INTERVAL);
    refreshLateTasks();
    registerAllEvents();
    started = true;
  }
};
export const stop = async () => {
  if (started) {
    clearInterval(tasksUpdateInterval);
    tasksUpdateInterval = null;
    started = false;
  }
};

const refreshLateTasks = async () => {
  const today = new Date();
  const before = sub(today, { months: 3 });

  const lateTasksResponse = await get('/api/tasks', null, {
    qs: {
      to: today,
      from: before,
      done: false,
    },
  });
  lateTasks.set(lateTasksResponse.tasks.map(t => ({ ...Task.fromObject(t), emailSubject: t.emailSubject })));
};

export const registerAllEvents = () => {
  registeredEvents.push(
    registerEvent('email:shared', async (payload) => {
      let email;
      try {
        const data = await get(`/api/emails/${payload.emailId}`);
        email = data.email;
      } catch (e) {
        console.log('Error: unable to fetch email', payload.emailId, payload);
        return;
      }
      insertEmailTasks(email);
    })
  );

  registeredEvents.push(
    registerEvent('email:task:done-status:updated', async (payload) => {
      const task = Task.fromObject(payload.task);
      if (task.done) {
        removeLateTask(task);
      } else {
        maybeAddLateTask(task, payload.emailId);
      }
    })
  );
};

const maybeAddLateTask = async (task, emailId) => {
  const now = new Date();
  let email;
  if (isBefore(now, task.deadline.date)) {
    try {
      const data = await get(`/api/emails/${emailId}`);
      email = data.email;
    } catch (e) {
      console.log('Error: unable to fetch email', emailId);
      return;
    }
    lateTasks.update((existingTasks) => {
      const newLateTasks = [...existingTasks];
      insertOneTask(newLateTasks, { ...task, emailSubject: email.email.subject });
      return newLateTasks;
    });
  }
};

const removeLateTask = (task) => {
  lateTasks.update((existingTasks) => {
    return existingTasks.filter(t => !t._id.equals(task._id));
  });
};

const insertEmailTasks = (email) => {
  const tasks = email.tasks
    .map(t => ({ ...Task.fromObject(t), emailSubject: email.email.subject }))
    .filter(t => {
      return t.assignee._id === currentUser._id && isAfter(new Date(), new Date(t.deadline.date));
    });
  if (!tasks.length) {
    return;
  }
  lateTasks.update((existingTasks) => {
    const newTasks = [];
    tasks.forEach((t) => {
      const found = existingTasks.some(et => et._id.equals(t._id));
      if (!found) {
        newTasks.push(t);
      }
    });
    if (!newTasks.length) {
      return existingTasks;
    }
    const updatedTasks = [...existingTasks];
    newTasks.forEach(t => insertOneTask(updatedTasks, t));
    return updatedTasks;
  });
};

const insertOneTask = (existing, task) => {
  const index = existing.findIndex((t) => isBefore(new Date(task.deadline.date), new Date(t.deadline.date)));
  if (index < 0) {
    existing.push(task);
  } else {
    existing.splice(index, 0, task);
  }
};
