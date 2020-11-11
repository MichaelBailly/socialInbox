export default {
  KAFKA: {
    TOPICS: {
      EVENTS: {
        NAME: 'sobox',
        CONSUMER_GROUP: 'sobox-events',
      },
      NOTIFICATIONS: {
        NAME: 'sobox-notifs',
        CONSUMER_GROUP: 'sobox-server',
      },
    },
    BROKERS: ['localhost:9093'],
    CLIENT_ID: 'sobox',
  },
  MONGODB: {
    CONNECTION: 'mongodb://localhost:27000/?poolSize=20&w=majority',
    DATABASE: 'sobox',
  },
  JMAP: {
    SESSION: 'https://dev.open-paas.org/jmap/session',
    JMAP: 'https://dev.open-paas.org/jmap',
    SYNC_EMAILS_PER_REQUESTS: 30,
    PERIODIC_SYNC_INTERVAL: 600000, // ms
    INITIAL_SYNC_PERIOD: { weeks: 1 }, // https://date-fns.org/v2.16.1/docs/sub duration
  },
};
