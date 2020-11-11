import Actor from '../../shared/actor';

export default class KafkaMessage {
  constructor(key, object) {
    this.key = key;
    this.object = object;
  }

  serialize() {
    return {
      key: this.key,
      value: JSON.stringify(this.object),
    };
  }

  sender() {
    return this.object.sender;
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

    if (!object.sender) {
      throw new Error('kafka message should have a message sender');
    }

    try {
      Actor.fromObject(object.sender);
    } catch (e) {
      throw new Error(
        `kafka message sender should be a valid Actor: ${e.message}`
      );
    }

    if (!key || !(typeof key === 'string')) {
      throw new Error('kafka message should have a key');
    }

    return new KafkaMessage(key, {
      event: object.event,
      payload: object.payload,
      sender: object.sender,
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
