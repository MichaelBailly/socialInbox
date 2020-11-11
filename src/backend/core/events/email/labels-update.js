import { recordActivity } from '../../activity';
import db from '../../../mongodb';
import logger from '../../logger';
import EmailLabelAddedActivity from '../../../../shared/email-label-added-activity';
import EmailLabelRemovedActivity from '../../../../shared/email-label-removed-activity';
import { getEmailIfAllowed } from '../../../api-middleware/email-permission';
import { ObjectId } from 'mongodb';

const debug = logger.extend('events:email:labels:update');

export async function emailLabelsUpdateReceiver(kafkaMessage) {
  debug('starts');
  const payload = kafkaMessage.payload();
  const emailId = payload.emailId;
  const labels = payload.labels.map((label) => ({
    ...label,
    _id: new ObjectId(label._id),
  }));

  const database = await db();
  const collection = database.collection('emails');

  const email = await getEmailIfAllowed(kafkaMessage.sender(), emailId);

  if (!email) {
    debug(
      'email not existing, or not allowed to do things on that email. Stop here'
    );
    return false;
  }

  const [added, removed] = getDifferences(email.labels, labels);

  try {
    const { modifiedCount } = await collection.updateOne(
      { _id: email._id },
      {
        $set: {
          labels,
          lastModified: new Date(),
        },
      }
    );
    debug('Email labels updated, modifiedCount=%i', modifiedCount);

    if (!modifiedCount) {
      throw new Error('No Mongo document has been updated during update query');
    }
  } catch (e) {
    debug('MongoDB document update failed: %s %s', e.message, e.stack);
    return false;
  }

  const addedActivities = added.map(
    (l) => new EmailLabelAddedActivity(kafkaMessage.sender(), emailId, l)
  );
  const removedActivities = removed.map(
    (l) => new EmailLabelRemovedActivity(kafkaMessage.sender(), emailId, l)
  );

  const activities = addedActivities.concat(removedActivities);

  if (!activities.length) {
    return;
  }

  while (activities.length) {
    await recordActivity(activities.pop(), emailId, true);
  }
}

function getDifferences(emailLabels, requestLabels) {
  const emailLabelsId = emailLabels.map((l) => l._id.toString());
  const requestLabelsId = requestLabels.map((l) => l._id.toString());
  const added = requestLabels.filter(
    (l) => !emailLabelsId.includes(l._id.toString())
  );
  const removed = emailLabels.filter(
    (l) => !requestLabelsId.includes(l._id.toString())
  );

  return [added, removed];
}

export const EVENTS = {
  'email:labels:update': emailLabelsUpdateReceiver,
};
