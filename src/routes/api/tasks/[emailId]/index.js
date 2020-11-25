import { ObjectId } from 'mongodb';
import { getEmailIfAllowed } from '../../../../backend/api-middleware/email-permission';
import { createTask } from '../../../../backend/core/commands/task';
import Actor from '../../../../shared/actor';
import EmailHead from '../../../../shared/email-head';

export async function post(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not connected' });
  }
  const currentUser = req.session.user;
  const emailId = req.params.emailId;

  const email = await getEmailIfAllowed(currentUser, emailId, res);
  if (!email) {
    return;
  }

  if (!req.body || !req.body.assignee || !req.body.deadline) {
    return res.status(400).json({
      error: 'request body should have properties body, assignee and dealine',
    });
  }

  const _id = new ObjectId();

  const task = {
    _id,
    creator: Actor.fromUser(currentUser),
    assignee: req.body.assignee,
    deadline: req.body.deadline,
    description: req.body.description,
    emailId,
    email: EmailHead.fromEmail(email.email),
    done: false,
    date: new Date(),
  };

  try {
    await createTask(task);
    return res.status(202).json({ _id });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
