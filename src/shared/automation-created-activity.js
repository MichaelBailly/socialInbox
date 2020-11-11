export const identifier = 'automation:created';

export default class AutomationCreatedActivity {
  constructor({ actor, automation, date = null }) {
    this.name = identifier;
    this.actor = actor;
    this.automation = automation;
    this.date = date || new Date();
  }

  static fromKafkaMessage(kafkaMessage) {
    return new AutomationCreatedActivity({
      actor: kafkaMessage.user(),
      automation: kafkaMessage.payload(),
    });
  }
}
