import { recordActivity } from '../../activity';
import db from '../../../mongodb';
import logger from '../../logger';
import EmailLabelAddedActivity from '../../../../shared/email-label-added-activity';
import EmailLabelRemovedActivity from '../../../../shared/email-label-removed-activity';
import { getEmailIfAllowed } from '../../../api-middleware/email-permission';
import { ObjectId } from 'mongodb';

const debug = logger.extend('events:email:labels:add');

export async function emailLabelsAddReceiver(kafkaMessage) {
  debug('starts');
  const payload = kafkaMessage.payload();
  const emailId = payload.emailId;
  const label = { ...payload.label, _id: new ObjectId(payload.label._id) };

  const database = await db();
  const collection = database.collection('emails');

  const email = await getEmailIfAllowed(kafkaMessage.sender(), emailId);

  if (!email) {
    debug(
      'email not existing, or not allowed to do things on that email. Stop here'
    );
    return false;
  }

  try {
    const { modifiedCount } = await collection.updateOne(
      {
        _id: email._id,
        'labels._id': { $ne: label._id },
      },
      {
        $push: { labels: label },
        $set: { lastModified: new Date() },
      }
    );
    debug('Email label add Query, modifiedCount=%i', modifiedCount);

    if (!modifiedCount) {
      throw new Error('No Mongo document has been updated during update query');
    }
  } catch (e) {
    debug('MongoDB document update failed: %s %s', e.message, e.stack);
    return false;
  }

  const activity = new EmailLabelAddedActivity(
    kafkaMessage.sender(),
    emailId,
    label
  );
  await recordActivity(activity, emailId, true);
}

export const EVENTS = {
  'email:label:add': emailLabelsAddReceiver,
};
