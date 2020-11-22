export const identifier = 'email:task:done-status:updated';

export default class TaskDoneStatusUpdatedActivity {
  constructor({ actor, task }) {
    this.name = identifier;
    this.actor = actor;
    this.task = task;
    this.date = new Date();
  }

  static fromObjects(task, actor) {
    return new TaskDoneStatusUpdatedActivity({
      actor,
      task,
    });
  }
}
