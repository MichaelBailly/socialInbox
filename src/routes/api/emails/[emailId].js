import db from '../../../backend/mongodb';
import { getEmailIfAllowed } from '../../../backend/api-middleware/email-permission';

export async function get(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;
  const email = await getEmailIfAllowed(currentUser._id, emailId);

  res.status(200).json({ email });
}
