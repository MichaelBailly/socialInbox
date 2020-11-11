import CONSTANTS from '../../constants';
import createConsumer from '../../kafka/notifications/consumer';
import JmapSynchronizer from './jmap-synchronizer';
import logger from '../logger/index';
import { getUsers } from '../api/users';

const debug = logger.extend('core:jmap:inbox-synchronizer');

const synchronizers = new Map();

export default async function startConsumer() {
  createConsumer('jmap-synchronizer', ({ kafkaMessage }) => {
    if (kafkaMessage.event() !== 'jwt:token:store:success') {
      return;
    }

    startSynchronizer(kafkaMessage.user(), kafkaMessage.payload().token);
  });
}

function startSynchronizer(user, token) {
  if (synchronizers.has(user._id)) {
    debug(
      `Synchronizer for user ${user._id}(${
        user.email
      }) already exists, running=${
        synchronizers.get(user._id).running
      }, initialSync=${synchronizers.get(user._id).initialSync}`
    );
    return;
  }

  const jmapSynchronizer = new JmapSynchronizer({
    jmapSessionURL: CONSTANTS.JMAP.SESSION,
    jmapURL: CONSTANTS.JMAP.JMAP,
    token: token,
    user,
  });
  jmapSynchronizer.start();
  synchronizers.set(user._id, jmapSynchronizer);
}

export async function runSynchronizers() {
  const users = await getUsers();
  users.forEach((user) => startSynchronizer(user, user.token));
}
