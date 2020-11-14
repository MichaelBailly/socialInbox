import { dbCol } from '../../backend/mongodb';
/*
 * Search / Lookup for users
 *
 * Form 1:
 * If the query contains a ids field, it's a comma separated list of user ids.
 * Lookup the user ids and send back the response.
 *
 * Form 2:
 * If the query contains a q field, the string is matched against email, lastname, firstname and displayName
 *
 * Form 3:
 * If the query contains an email field, the search is done on this exact email
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
  if (req.query && req.query.email) {
    try {
      return findByEmail(req, res);
    } catch (e) {
      return res.status(500).json({ error: e.message, stack: e.stack });
    }
  }
  return res.status(501).json({ error: 'Not implemented' });
}

const lookupByIds = async (req, res) => {
  const ids = req.query.ids.split(',');

  const collection = await dbCol('userinfos');

  const userInfos = await collection
    .find({ _id: { $in: ids } })
    .sort({ email: 1 })
    .toArray();

  return res.status(200).json(sanitizeUserInfos(userInfos));
};

const search = async (req, res) => {
  const q = req.query.q.replace(/[^-a-zA-Z0-9_@.]/g, '');
  const mongoRegex = { $regex: q, $options: 'i' };
  const collection = await dbCol('userinfos');

  const userInfos = await collection
    .find({
      $or: [
        { email: mongoRegex },
        { firstname: mongoRegex },
        { lastname: mongoRegex },
        { displayName: mongoRegex },
      ],
    })
    .sort({ email: 1 })
    .toArray();

  return res.status(200).json(sanitizeUserInfos(userInfos));
};

const findByEmail = async (req, res) => {
  const email = req.query.email;
  const collection = await dbCol('userinfos');

  const userInfos = await collection.findOne({
    email,
  });

  return res.status(200).json(sanitizeUserInfos([userInfos]).pop());
};

const sanitizeUserInfos = (userInfos) => {
  return userInfos.map((user) => {
    const u2 = { ...user };
    u2.token = undefined;
    return u2;
  });
};
