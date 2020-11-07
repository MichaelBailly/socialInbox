export const identifier = 'chat:started';

export default class ChatStartActivity {
  constructor(actor, date = null) {
    this.name = identifier;
    this.actor = actor;
    this.date = date || new Date();
  }
}
