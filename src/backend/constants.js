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
  MONGODB: {
    CONNECTION: "mongodb+srv://localhost:27000/?poolSize=20&w=majority",
    DATABASE: "sobox",
  },
};
