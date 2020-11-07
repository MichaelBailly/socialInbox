export const identifier = 'email:share';
export default class EmailShareActivity {
  constructor(actor, target, date = null) {
    this.name = identifier;
    this.actor = actor;
    this.target = target;
    this.date = date || new Date();
  }
}
