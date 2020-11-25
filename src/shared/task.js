import { ObjectId } from 'bson';
import Actor from './actor';

const DEADLINE_SCALES = ['hour', 'day', 'week'];

export default class Task {
  constructor({
    _id,
    emailId,
    email,
    creator,
    assignee,
    deadline,
    description,
    done,
    date,
  }) {
    this._id = _id;
    this.emailId = emailId;
    this.email = email;
    this.creator = creator;
    this.assignee = assignee;
    this.deadline = { ...deadline };
    this.description = description || '';
    this.done = done;
    this.date = date;
  }

  static fromObject({
    _id,
    emailId,
    email = {},
    creator,
    assignee,
    deadline,
    description,
    done,
    date,
  }) {
    if (!_id) {
      throw new Error('needs an _id to create the task');
    }

    const taskId = new ObjectId(_id);

    const taskCreator =
      creator && creator.origin
        ? Actor.fromObject(creator)
        : Actor.fromUser(creator);
    const taskAssignee =
      assignee && assignee.origin
        ? Actor.fromObject(assignee)
        : Actor.fromUser(assignee);

    if (!emailId || typeof emailId !== 'string') {
      throw new Error('Task should have an emailId');
    }

    if (!email) {
      throw new Error('email should exist');
    }

    if (!deadline || !deadline.date) {
      throw new Error('deadline should have a date property');
    }
    if (!deadline.count || isNaN(parseInt(deadline.count, 10))) {
      throw new Error('deadline should have a count integer property');
    }
    if (!deadline.scale || !DEADLINE_SCALES.includes(deadline.scale)) {
      throw new Error(
        'deadline should have a scale property that is in DEADLINE_SCALES set'
      );
    }
    const taskDeadline = {
      scale: deadline.scale,
      count: deadline.count,
      date: new Date(deadline.date),
    };

    if (isNaN(taskDeadline.date.getTime())) {
      throw new Error('deadline.date should be a valid date');
    }

    if (!(typeof description === 'string')) {
      throw new Error('descrption should be a String');
    }

    const taskDate = date ? new Date(date) : new Date();

    return new Task({
      _id: taskId,
      emailId,
      email,
      creator: taskCreator,
      assignee: taskAssignee,
      deadline: taskDeadline,
      description,
      done: Boolean(done),
      date: taskDate,
    });
  }
}
