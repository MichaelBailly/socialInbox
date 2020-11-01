import CONSTANTS from '../../constants';
import createConsumer from '../../kafka/notifications/consumer';
import JmapSynchronizer from './jmap-synchronizer';

const synchronizers = new Map();

export default async function startConsumer() {
  createConsumer('jmap-synchronizer', ({ kafkaMessage }) => {
    if (kafkaMessage.event() !== 'jwt:token:store:success') {
      return;
    }

    const user = kafkaMessage.user();
    if (synchronizers.has(user)) {
      return;
    }

    const jmapSynchronizer = new JmapSynchronizer({
      jmapSessionURL: CONSTANTS.JMAP.SESSION,
      jmapURL: CONSTANTS.JMAP.JMAP,
      token: kafkaMessage.payload().token,
      email: kafkaMessage.user(),
    });
    jmapSynchronizer.start();
    synchronizers.set(kafkaMessage.user(), jmapSynchronizer);
  });
}
