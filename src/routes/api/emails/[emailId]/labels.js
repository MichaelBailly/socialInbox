import { getEmailIfAllowed } from '../../../../backend/api-middleware/email-permission';
import db from '../../../../backend/mongodb';
import { ObjectId } from 'mongodb';
import { setLabels } from '../../../../backend/core/commands/email';
import Actor from '../../../../shared/actor';

export async function put(req, res) {
  const { emailId } = req.params;
  const currentUser = req.session.user;
  let labelIds;

  if (!req.body || !req.body.labelIds || !Array.isArray(req.body.labelIds)) {
    return res.status(400).json({
      error: 'missing labelIds property (array) in JSON body payload.',
    });
  }

  try {
    labelIds = req.body.labelIds.map((id) => new ObjectId(id));
  } catch (e) {
    return res.status(400).json({ error: 'Bad format for labelIds.' });
  }

  const email = await getEmailIfAllowed(currentUser, emailId);
  if (!email) {
    return;
  }

  const database = await db();
  const collection = database.collection('labels');
  const labels = await collection.find({ _id: { $in: labelIds } }).toArray();

  if (labels.length !== labelIds.length) {
    return res
      .status(400)
      .json({ error: 'Some label ids does not exist in database.' });
  }

  try {
    await setLabels(Actor.fromUser(currentUser), email, labels);
    res.status(201).send('');
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}
