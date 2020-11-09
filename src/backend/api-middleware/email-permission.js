import db from '../mongodb';

export async function getEmailIfAllowed(userId, emailId, res = null) {
  const database = await db();
  const emailCollection = database.collection('emails');
  const email = await emailCollection.findOne({ _id: emailId });

  if (!email) {
    res && res.status(404).json({ error: `email ${emailId} no found` });
    return false;
  }

  // user should have already access to email to share
  if (!email.users.concat(email.usersShared).includes(userId)) {
    res &&
      res.status(401).json({ error: 'Not authorized to share this email' });
    return false;
  }
  return email;
}
