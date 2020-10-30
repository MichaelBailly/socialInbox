const { Kafka } = require("kafkajs");
import CONSTANTS from "../constants";

const kafka = new Kafka({
  clientId: CONSTANTS.KAFKA.CLIENT_ID,
  brokers: CONSTANTS.KAFKA.BROKERS,
});

export default kafka;
