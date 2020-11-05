import db from '../../../backend/mongodb';

export async function get(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;

  const database = await db();
  const collection = database.collection('emails');
  const email = await collection.findOne({ _id: emailId });

  if (!email) {
    return res.status(404).json({ error: `email ${emailId} no found` });
  }

  // user should have already access to email to share
  if (
    !email.users.includes(currentUser._id) &&
    !email.usersShared.includes(currentUser._id)
  ) {
    return res
      .status(401)
      .json({ error: 'Not authorized to share this email' });
  }

  res.status(200).json({ email });
}
