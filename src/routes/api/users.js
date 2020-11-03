import db from '../../backend/mongodb';
/*
 * Search / Lookup for users
 *
 * Form 1:
 * If the query contains a ids field, it's a comma separated list of user ids.
 * Lookup the user ids and send back the response.
 *
 * Form 2:
 * If the query contains a q field, the string is matched against email, lastname, firstname and displayName
 */
export async function get(req, res) {
  if (req.query && req.query.ids) {
    try {
      return lookupByIds(req, res);
    } catch (e) {
      return res.status(500).json({ error: e.message, stack: e.stack });
    }
  }
  if (req.query && req.query.q) {
    try {
      return search(req, res);
    } catch (e) {
      return res.status(500).json({ error: e.message, stack: e.stack });
    }
  }
  return res.status(501).json({ error: 'Not implemented' });
}

const lookupByIds = async(req, res) => {
  console.log('ids', req.query.ids);
  const ids = req.query.ids.split(',');

  const database = await db();
  const collection = database.collection('userinfos');

  const userInfos = await collection.find({ _id: { $in: ids } }).sort({ email: 1 }).toArray();

  return res.status(200).json(sanitizeUserInfos(userInfos));
};

const search = async(req, res) => {
  const q = req.query.q.replace(/[^-a-zA-Z0-9_@.]/g, '');
  const mongoRegex = { $regex: q, $options: 'i'};
  const database = await db();
  const collection = database.collection('userinfos');

  const userInfos = await collection.find({ $or: [
    { email: mongoRegex },
    { firstname: mongoRegex },
    { lastname: mongoRegex },
    { displayName: mongoRegex },
  ]}).sort({ email: 1 }).toArray();

  return res.status(200).json(sanitizeUserInfos(userInfos));
};

const sanitizeUserInfos = (userInfos) => {
  return userInfos.map(user => {
    const u2 = { ...user };
    u2.token = undefined;
    return u2;
  });
};
