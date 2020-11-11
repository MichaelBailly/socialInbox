import { createAutomation } from '../../../backend/core/commands/automation';
import { requireUser } from '../../../backend/api-middleware/user';
import { dbCol } from '../../../backend/mongodb';

export async function post(req, res) {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }

  if (typeof req.body !== 'object' || req.body === null) {
    return res.status(400).json({ error: 'request body invalid' });
  }

  try {
    const automationId = await createAutomation(req.body, currentUser);
    return res.status(202).json({ _id: automationId });
  } catch (e) {
    return res.status(400).json({ messsage: e.message, stack: e.stack });
  }
}

export async function get(req, res) {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }

  try {
    const collection = await dbCol('automations');
    const allAutomations = await collection.find({}).toArray();

    return res.status(200).json(allAutomations);
  } catch (e) {
    return res.status(500).json({ message: e.message, stack: e.stack });
  }
}
