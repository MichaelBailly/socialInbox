export const identifier = 'email:task:created';

export default class TaskCreatedActivity {
  constructor({ actor, target, task }) {
    this.name = identifier;
    this.actor = actor;
    this.target = target;
    this.task = task;
    this.date = new Date();
  }

  static fromKafkaMessage(kafkaMessage) {
    const payload = kafkaMessage.payload();
    return new TaskCreatedActivity({
      actor: kafkaMessage.sender(),
      target: payload.assignee,
      task: payload,
    });
  }
}
