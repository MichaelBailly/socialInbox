import { ObjectId } from 'bson';
import { getEmailIfAllowed } from '../../../../../backend/api-middleware/email-permission';
import { requireUser } from '../../../../../backend/api-middleware/user';
import { updateDoneStatus } from '../../../../../backend/core/commands/task';

export async function put(req, res) {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }
  const email = await getEmailIfAllowed(currentUser, req.params.emailId, res);
  if (!email) {
    return;
  }

  if (!('done' in req.body) || (req.body.done !== true && req.body.done !== false)) {
    return res.status(400).json({ error: 'JSON body should contain a boolean done attribute' });
  }
  const done = req.body.done;

  let taskId;
  try {
    taskId = new ObjectId(req.params.taskId);
  } catch (e) {
    return res.status(400).json({ error: 'Bad format for taskId (should be ObjectId' });
  }

  try {
    await updateDoneStatus(currentUser, email._id, taskId, done);
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
  return res.status(202).json({ done });
}
