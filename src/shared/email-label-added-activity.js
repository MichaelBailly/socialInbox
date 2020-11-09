export const identifier = 'email:label:added';
export default class EmailLabelAddedActivity {
  constructor(actor, emailId, label, date = null) {
    this.name = identifier;
    this.actor = actor;
    this.emailId = emailId;
    this.label = label;
    this.date = date || new Date();
  }
}
