import logger from '../../logger';
import { setLabels, addShare } from '../../commands/email';
import Actor from '../../../../shared/actor';
import { dbCol } from '../../../mongodb';

const aDebug = logger.extend('actions');

const labelProcessor = async (email, value, actor) => {
  const debug = aDebug.extend('label');
  debug(
    'launching processor on email %s, label %s(%s)',
    email._id,
    value._id,
    value.name
  );
  const labels = [...email.labels, ...value];
  return await setLabels(actor, email, labels);
};

const shareProcessor = async (email, value, actor) => {
  const debug = aDebug.extend('share');
  debug('launching processor on email %s, user %O', email._id, value);
  const targets = [...value];
  while (targets.length) {
    const targetObj = targets.shift();
    debug('Target: %O', targetObj);
    const targetUser = await getUser(targetObj._id);
    if (!targetUser) {
      debug('User with _id %s not found.', targetObj._id);
    } else {
      debug('Found user %s', targetObj.email);
      const target = Actor.fromUser(targetUser);
      return await addShare(actor, email, actor, target);
    }
  }
};

const getUser = async (_id) => {
  const collection = await dbCol('userinfos');
  return await collection.findOne({ _id });
};

export const actions = {
  label: labelProcessor,
  share: shareProcessor,
};
