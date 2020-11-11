import db from '../../../../backend/mongodb';
import { addShare } from '../../../../backend/core/commands/email';
import { getEmailIfAllowed } from '../../../../backend/api-middleware/email-permission';

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

  const email = await getEmailIfAllowed(currentUser, emailId);

  if (!email) {
    return;
  }

  const database = await db();
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
