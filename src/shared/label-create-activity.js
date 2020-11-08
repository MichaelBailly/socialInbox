export const identifier = 'label:created';
export default class LabelCreateActivity {
  constructor(actor, label, date = null) {
    this.name = identifier;
    this.actor = actor;
    this.label = label;
    this.date = date || new Date();
  }
}
