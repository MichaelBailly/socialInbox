import CONSTANTS from '../../constants';
import createConsumer from '../../kafka/notifications/consumer';
import JmapSynchronizer from './jmap-synchronizer';
import logger from '../logger/index';

const debug = logger.extend('core:jmap:inbox-synchronizer');

const synchronizers = new Map();

export default async function startConsumer() {
  createConsumer('jmap-synchronizer', ({ kafkaMessage }) => {
    if (kafkaMessage.event() !== 'jwt:token:store:success') {
      return;
    }

    const user = kafkaMessage.user();
    if (synchronizers.has(user.id)) {
      debug(`Synchronizer for user ${user.id}(${user.email}) already exists, running=${synchronizers.get(user.id).running}, initialSync=${synchronizers.get(user.id).initialSync}`);
      return;
    }

    const jmapSynchronizer = new JmapSynchronizer({
      jmapSessionURL: CONSTANTS.JMAP.SESSION,
      jmapURL: CONSTANTS.JMAP.JMAP,
      token: kafkaMessage.payload().token,
      user,
    });
    jmapSynchronizer.start();
    synchronizers.set(user.id, jmapSynchronizer);
  });
}
