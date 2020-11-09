export const identifier = 'email:label:removed';
export default class EmailLabelRemovedActivity {
  constructor(actor, emailId, label, date = null) {
    this.name = identifier;
    this.actor = actor;
    this.emailId = emailId;
    this.label = label;
    this.date = date || new Date();
  }
}
