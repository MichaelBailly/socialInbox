import { getEmailIfAllowed } from '../../../../backend/api-middleware/email-permission';
import { updateUserStateSeen } from '../../../../backend/core/commands/email';

export async function put(req, res) {
  const { emailId } = req.params;
  const currentUser = req.session.user;

  if (!req.body || !('read' in req.body)) {
    return res.status(400).json({
      error: 'missing read property (boolean) in JSON body payload.',
    });
  }

  const readStatus = !!req.body.read;

  const email = await getEmailIfAllowed(currentUser, emailId);
  if (!email) {
    return;
  }

  if (email.userState[currentUser._id] && ('seen' in email.userState[currentUser._id]) && email.userState[currentUser._id].seen === readStatus) {
    return res.status(202).send();
  }

  try {
    await updateUserStateSeen(currentUser, email, readStatus);
    return res.status(202).send();
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
