import { dbCol } from '../../mongodb';
import logger from '../logger';
import { triggers } from './triggers';
import { actions } from './actions';
import Actor from '../../../shared/actor';

const debug = logger.extend('automations');

export async function applyAutomations(kafkaMessage) {
  const automations = [...(await getAutomations())];
  if (!automations.length) {
    debug('no automation defined.');
    return;
  }

  const email = await getEmail(kafkaMessage.payload().emailId);

  if (!email) {
    debug('Email "%s" not found.', emailId);
  }

  while (automations.length) {
    const automation = automations.shift();
    debug('apply automation %s on email %s', automation.name, email._id);
    await applyAutomation(automation, email);
  }

  debug('end of automation run');
}

async function getAutomations() {
  const collection = await dbCol('automations');
  const automations = await collection.find({}).toArray();
  return automations;
}

async function getEmail(emailId) {
  const collection = await dbCol('emails');
  return await collection.findOne({ _id: emailId });
}

async function applyAutomation(def, email) {
  if (!triggers[def.trigger.processor]) {
    debug('Invalid trigger: %s', def.trigger.processor);
    return false;
  }
  debug('automation trigger: %s', def.trigger.processor);
  const triggered = await triggers[def.trigger.processor](
    email,
    def.trigger.value
  );
  debug('automation trigger result: %j', triggered);
  if (!triggered) {
    return false;
  }
  debug('launching automation actions');
  let actionCount = 0;
  const automationActor = Actor.fromObject({
    _id: def._id,
    origin: 'automation',
    name: def.name,
  });

  const automationActions = [...def.actions];
  while (automationActions.length) {
    const action = automationActions.shift();
    if (!actions[action.processor]) {
      debug('Invalid action processor %s', action.processor);
    } else {
      await actions[action.processor](email, action.value, automationActor);
      actionCount++;
    }
  }
  debug('end of automation "%s", %i actions launched', def.name, actionCount);
}
