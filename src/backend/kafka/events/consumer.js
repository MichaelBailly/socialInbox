import CONSTANTS from "../../constants";
import kafka from "../client";
import logger from "../../core/logger";
import KafkaMessage from "../kafka-message";

const debug = logger.extend("kafka-consumer");

const consumer = kafka.consumer({
  groupId: CONSTANTS.KAFKA.TOPICS.EVENTS.CONSUMER_GROUP,
});

export default async function run() {
  try {
    debug("connecting");
    await consumer.connect();
  } catch (e) {
    debug("connection failed: %O", e);
    process.exit(1);
  }

  try {
    debug("subscribing");
    await consumer.subscribe({ topic: CONSTANTS.KAFKA.TOPICS.EVENTS.NAME });
  } catch (e) {
    debug("subscription failed: %O", e);
    process.exit(1);
  }

  try {
    debug("starting message consuming");
    await consumer.run({
      eachMessage: onMessage,
    });
  } catch (e) {
    debug("message consuming failed: %O", e);
  }
}

const onMessage = async ({ message }) => {
  console.log({
    key: message.key.toString(),
    value: message.value.toString(),
    headers: message.headers,
  });
};
