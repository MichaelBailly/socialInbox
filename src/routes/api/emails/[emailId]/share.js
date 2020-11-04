import db from '../../../../backend/mongodb';
import { addShare } from '../../../../backend/core/commands/email';

export async function post(req, res) {
  const currentUser = req.session.user;
  const emailId = req.params.emailId;
  const userIds = req.body.userIds;
  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Body {userIds} should be an array' });
  }
  const invalidUserIds = userIds.some((uid) => typeof uid !== 'string');
  if (invalidUserIds) {
    return res
      .status(400)
      .json({ error: 'Body {userIds[userId]} should be a string' });
  }

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

  const userCollection = database.collection('userinfos');
  const users = await userCollection.find({ _id: { $in: userIds } }).toArray();

  if (!users || !users.length) {
    return res
      .status(400)
      .json({ error: 'userIds: no user found in database' });
  }

  const elligibleUserIds = users
    .map((u) => u._id)
    .filter(
      (id) => !email.users.includes(id) && !email.usersShared.includes(id)
    );

  if (!elligibleUserIds.length) {
    return res
      .status(400)
      .json({ error: 'userIds: all users found are already in email share' });
  }

  const elligibleUsers = users.filter((u) => elligibleUserIds.includes(u._id));

  elligibleUsers.forEach((user) => {
    addShare(currentUser, email, currentUser, user);
  });

  res.status(200).json({ userIds: elligibleUserIds });
}
