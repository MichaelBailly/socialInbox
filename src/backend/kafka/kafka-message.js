export default class KafkaMessage {
  constructor(key, object) {
    this.key = key;
    this.object = object;
  }

  topic() {
    return this.object.topic;
  }

  serialize() {
    return {
      key: this.key,
      value: JSON.stringify(this.object),
    };
  }

  user() {
    return this.object.user;
  }

  userId() {
    return this.object.userId;
  }

  userEmail() {
    return this.object.userEmail;
  }

  event() {
    return this.object.event;
  }

  payload() {
    return this.object.payload;
  }

  setEvent(eventName) {
    const object = JSON.parse(JSON.stringify(this.object));
    object.event = eventName;

    return KafkaMessage.fromObject(this.key, object);
  }

  static fromObject(key, object) {
    if (!object.event) {
      throw new Error('kafka message should have a message event');
    }
    if (!object.payload) {
      throw new Error('kafka message should have a message payload');
    }

    if (!object.user) {
      throw new Error('kafka message should have a message user');
    }

    if (!object.user.id) {
      throw new Error('kafka message user should have an id property');
    }

    if (!object.user.email) {
      throw new Error('kafka message user should have an email property');
    }

    if (!key || !(typeof key === 'string')) {
      throw new Error('kafka message should have a key');
    }

    return new KafkaMessage(key, {
      event: object.event,
      payload: object.payload,
      user: object.user,
      userEmail: object.userEmail,
    });
  }

  static fromKafka(key, message) {
    const object = JSON.parse(message);
    if (Object.prototype.toString.call(object) !== '[object Object]') {
      throw new Error('kafka message: should get an object');
    }

    return KafkaMessage.fromObject(key, object);
  }
}
