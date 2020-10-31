export default {
  KAFKA: {
    TOPICS: {
      EVENTS: {
        NAME: "sobox",
        CONSUMER_GROUP: "sobox-events",
      },
      NOTIFICATIONS: "sobox-notifs",
    },
    BROKERS: ["localhost:9093"],
    CLIENT_ID: "sobox",
  },
};
