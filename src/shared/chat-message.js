import UserProj from './user-proj';

export default class ChatMessage {
  constructor({ emailId, user, uuid, body, date, _id = null }) {
    this._id = _id;
    this.emailId = emailId;
    this.user = user;
    this.uuid = uuid;
    this.body = body;
    this.date = new Date(date);
  }

  toMongoObject() {
    const result = {
      emailId: this.emailId,
      user: this.user,
      uuid: this.uuid,
      body: this.body,
      date: this.date,
    };
    if (this._id) {
      result._id = this._id;
    }

    return result;
  }

  static fromObject(object) {
    if (!object.emailId) {
      throw new Error('emailId required');
    }
    if (!object.uuid || object.uuid.length < 12) {
      throw new Error('uuid required, should be at least 12 chars long');
    }
    if (!object.body) {
      throw new Error('body required');
    }
    if (!object.date || !new Date(object.date)) {
      throw new Error('date required, should be a valid date');
    }
    const userProj = UserProj.fromObject(object.user);

    return new ChatMessage({
      emailId: object.emailId,
      user: userProj,
      uuid: object.uuid,
      body: object.body,
      date: object.date,
      _id: object._id,
    });
  }
}
