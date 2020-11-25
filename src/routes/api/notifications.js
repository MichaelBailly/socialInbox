import { requireUser } from '../../backend/api-middleware/user';
import { dbCol } from '../../backend/mongodb';

/**
 * Get notifications for the current user
 *
 * @param {express.Request} req express.js request
 * @param {express.Response} res express.js response
 */
export async function get(req, res) {
  const currentUser = await requireUser(req, res);
  if (!currentUser) {
    return;
  }

  try {
    const collection = await dbCol('userNotifications');
    const notifications = await collection
      .find({ 'user._id': currentUser._id, seen: false })
      .sort({ 'activity.date': -1 })
      .toArray();

    return res.status(200).json(notifications);
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}

/**
 * Update notification read status for the current user
 *
 * body JSON param:
 *
 * ```javascript
 *   { markReadUntil: String (Date.toIsoString) }
 * ```
 *
 * @param {express.Request} req express.js request
 * @param {express.Response} res express.js response
 */
export async function post(req, res) {
  const currentUser = await requireUser(req, res);
  if (!currentUser) {
    return;
  }

  if (!req.body || !req.body.markReadUntil) {
    return res.status(400).json({ error: 'Body should contain a markReadUntil property' });
  }

  const date = new Date(req.body.markReadUntil);

  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Body markReadUntil property should be a valid date' });
  }

  try {
    const collection = await dbCol('userNotifications');
    const { updatedCount } = collection.updateMany({ 'activity.date': { $lte: date } }, {
      $set: { seen: true },
    });

    return res.status(200).json({ updated: updatedCount });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
