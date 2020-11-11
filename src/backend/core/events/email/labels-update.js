import { recordActivity } from '../../activity';
import db from '../../../mongodb';
import logger from '../../logger';
import EmailLabelAddedActivity from '../../../../shared/email-label-added-activity';
import EmailLabelRemovedActivity from '../../../../shared/email-label-removed-activity';
import UserProj from '../../../../shared/user-proj';
import { getEmailIfAllowed } from '../../../api-middleware/email-permission';
import { ObjectId } from 'mongodb';
import KafkaMessage from '../../../kafka/kafka-message';

const debug = logger.extend('events:email:labels:update');

export async function emailLabelsUpdateReceiver(kafkaMessage) {
  const payload = kafkaMessage.payload();
  const emailId = payload.emailId;
  const labels = payload.labels.map((label) => ({
    ...label,
    _id: new ObjectId(label._id),
  }));

  const database = await db();
  const collection = database.collection('emails');

  const email = await getEmailIfAllowed(kafkaMessage.user()._id, emailId);

  if (!email) {
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

    if (!modifiedCount) {
      throw new Error('No Mongo document has been updated during update query');
    }
  } catch (e) {
    debug('MongoDB document update failed: %s %s', e.message, e.stack);
    return false;
  }

  const addedActivities = added.map(
    (l) => new EmailLabelAddedActivity(kafkaMessage.user(), emailId, l)
  );
  const removedActivities = removed.map(
    (l) => new EmailLabelRemovedActivity(kafkaMessage.user(), emailId, l)
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
