export const identifier = 'automation:updated';

export default class AutomationUpdatedActivity {
  constructor({ actor, automation, date = null }) {
    this.name = identifier;
    this.actor = actor;
    this.automation = automation;
    this.date = date || new Date();
  }

  static fromKafkaMessage(kafkaMessage) {
    return new AutomationUpdatedActivity({
      actor: kafkaMessage.sender(),
      automation: kafkaMessage.payload(),
    });
  }
}
