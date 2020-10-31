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

  event() {
    return this.object.event;
  }

  payload() {
    return this.object.payload;
  }

  static fromObject(key, object) {
    if (!object.event) {
      throw new Error('kafka message should have a message event');
    }
    if (!object.payload) {
      throw new Error('kafka message should have a message payload');
    }
    if (!key || !(typeof key === 'string')) {
      throw new Error('kafka message should have a key');
    }

    return new KafkaMessage(key, {
      event: object.event,
      payload: object.payload,
      user: object.user,
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
