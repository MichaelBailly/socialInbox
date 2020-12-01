import { ObjectId } from 'bson';
import { requireUser } from '../../../backend/api-middleware/user';
import { markSeenBefore, markSeenById } from '../../../backend/core/commands/user-notification';
import Actor from '../../../shared/actor';

/**
 * Set the notification seen status to "true",
 * according to the following criterias:
 *
 * "lastActivityDate": String(Date)
 * If the body contains lastActivityDate, all the notifications
 * for which associated activity date is before or at the time of
 * lastActivityDate will have their seen status set to true
 *
 * "id": String(userNotificationId)
 * If the body contains an "id" property, the user notification
 * related to this id will have its status set to true
 * @param {express.Request} req HTTP request object
 * @param {express.Response} res HTTP response object
 */
export async function post(req, res) {
  const currentUser = requireUser(req, res);
  if (!currentUser) {
    return;
  }

  if (req.body && req.body.lastActivityDate) {
    return await setSeenByActivityDate(req, res, currentUser);
  }

  if (req.body && req.body.id) {
    return await setSeenById(req, res, currentUser);
  }

  return res.status(501).json({ error: 'Not Implemented' });
}

const setSeenByActivityDate = async (req, res, currentUser) => {
  const date = new Date(req.body.lastActivityDate);
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: 'lastActivityDate body property should be a valid date' });
  }

  try {
    await markSeenBefore(date, Actor.fromUser(currentUser));
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ error: e.message });
  }

  return res.status(202).send('');
};

const setSeenById = async (req, res, currentUser) => {
  let _id;

  try {
    _id = new ObjectId(req.body.id);
  } catch (e) {
    e.status = 400;
    return res.status(400).json({ error: e.message });
  }

  try {
    await markSeenById(_id, Actor.fromUser(currentUser));
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ error: e.message });
  }

  return res.status(202).send('');
};
