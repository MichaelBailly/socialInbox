import { dbCol } from '../../../backend/mongodb';
import { requireUser } from '../../../backend/api-middleware/user';
import { ObjectId } from 'mongodb';
import { updateAutomation } from '../../../backend/core/commands/automation';

export async function get(req, res) {
  const automationId = req.params.automationId;
  const user = await requireUser(req, res);
  if (!user) {
    return;
  }

  let _id;

  try {
    _id = new ObjectId(automationId);
  } catch (e) {
    return res.status(400).json({ error: 'Bad format for automation id' });
  }

  try {
    const collection = await dbCol('automations');
    const automation = await collection.findOne({ _id });
    res.status(200).json(automation);
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}

export async function put(req, res) {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }

  if (typeof req.body !== 'object' || req.body === null) {
    return res.status(400).json({ error: 'request body invalid' });
  }

  const automation = { ...req.body };
  automation._id = new ObjectId(req.params.automationId);

  try {
    const automationResponse = await updateAutomation(automation, currentUser);
    return res.status(202).json(automationResponse);
  } catch (e) {
    return res.status(400).json({ messsage: e.message, stack: e.stack });
  }
}
