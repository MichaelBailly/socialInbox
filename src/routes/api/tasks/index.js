import { add, differenceInDays } from 'date-fns';
import { requireUser } from '../../../backend/api-middleware/user';
import { dbCol } from '../../../backend/mongodb';
const TASK_ROLES = ['assignee', 'creator'];
const TASK_DONE = {
  true: true,
  false: false,
  both: 'both',
};

/**
 * Allow to query tasks for a user
 *
 * Search will happen on a number of days which is:
 *
 * 1st day (most recent) = to, last day (older) = from
 *
 * Required parameter (query string):
 * - to: ISODate end of the period (most recent date)
 *         Have it in JS: new Date.toISOString()
 * - from: ISODate beginning of the period (most recent date)
 *         Have it in JS: new Date.toISOString()
 *
 * Optional parameters:
 * - role: either "creator" or "assignee"
 *         default: "assignee"
 * - done: either "true", "false" or "both"
 *
 * @param {express.Request} req http request
 * @param {express.Response} res http response
 */

export async function get(req, res) {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }

  if (!req.query.from) {
    return res.status(400).json({ error: 'from query string paramter is required' });
  }
  const from = new Date(req.query.from);
  if (isNaN(from.getTime())) {
    return res.status(400).json({ error: 'from query string paramter should be a valid isodate' });
  }

  if (!req.query.to) {
    return res.status(400).json({ error: 'to query string paramter is required' });
  }
  const to = new Date(req.query.to);
  if (isNaN(from.getTime())) {
    return res.status(400).json({ error: 'to query string paramter should be a valid isodate' });
  }

  let role;
  if (req.query.role) {
    if (!TASK_ROLES.includes(req.query.role)) {
      return res.status(400).json({ error: `role query string parameter should be in [${TASK_ROLES.join(', ')}]` });
    }
    role = req.query.role;
  } else {
    role = TASK_ROLES[0];
  }

  let done = TASK_DONE.both;
  if ('done' in req.query) {
    if (!(req.query.done in TASK_DONE)) {
      return res.status(400).json({ error: `done query string parameter should be in [${Object.keys(TASK_DONE).join(', ')}]` });
    }
    done = TASK_DONE[req.query.done];
  }

  const match = {
    'deadline.date': {
      $gte: from,
      $lte: to,
    },
    [`${role}._id`]: '5f994fc96233925b401ec3a9',
    [`${role}.origin`]: 'user',
  };

  if (done !== TASK_DONE.both) {
    match.done = done;
  }

  const taskMatch = {};
  Object.keys(match).forEach(k => {
    taskMatch[`tasks.${k}`] = match[k];
  });

  const aggregationQuery = [
    {
      $match: {
        tasks: {
          $elemMatch: match,
        },
      },
    },
    { $unwind: '$tasks' },
    { $match: taskMatch },
    {
      $set: {
        'tasks.emailSubject': '$email.subject',
      },
    },
    {
      $replaceRoot: { newRoot: '$tasks' },
    },
    {
      $sort: { 'deadline.date': 1 },
    },
  ];

  try {
    const collection = await dbCol('emails');
    const tasks = await collection.aggregate(aggregationQuery).toArray();

    const nextQueryFrom = add(to, { seconds: 1 });
    const nextQueryTo = add(nextQueryFrom, { days: differenceInDays(to, from) });

    res.status(200).json({
      tasks,
      next: {
        role,
        from: nextQueryFrom,
        to: nextQueryTo,
        done,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
};
