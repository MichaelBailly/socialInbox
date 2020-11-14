/*
// given an array of emailId, responds:
//
// Per emailId:
//   - total number of messages
//   - the lastReadTimestamp (or 0)
//   - an array of timestamps of messages after the last read one
//
[
  {
    emailId: 'X',
    totalMessages: 45,
    lastSeen: 12323345345,
    timestamps: [
      1232343453456,
      1232343453458,
    ]
  }
]

*/

import { dbCol } from '../../../backend/mongodb';

export async function post(req, res) {
  const currentUser = req.session.user;
  if (!currentUser) {
    return res.status(401).json({ error: 'should be authenticated' });
  }

  const emailIds = req.body;
  if (!Array.isArray(emailIds)) {
    return res.status(400).json({ error: 'Body should be an array' });
  }

  const chatMessagesUserData = await dbCol('chatMessagesUserData');
  const resultHash = {};
  emailIds.forEach((emailId) => {
    resultHash[emailId] = {
      emailId,
      totalMessages: 0,
      lastSeen: 0,
      timestamps: [],
    };
  });
  try {
    const lastUnreads = await chatMessagesUserData
      .find({ emailId: { $in: emailIds }, userId: currentUser._id })
      .toArray();

    lastUnreads.forEach((doc) => {
      if (doc.lastSeenMessage && doc.lastSeenMessage.ts) {
        resultHash[doc.emailId].lastSeen = doc.lastSeenMessage.ts;
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }

  const chatMessagesCollection = await dbCol('chatMessages');

  try {
    const messageParts = await chatMessagesCollection
      .find(
        { emailId: { $in: emailIds } },
        { projection: { emailId: 1, date: 1 } }
      )
      .toArray();

    messageParts.forEach((messagePart) => {
      const ts = new Date(messagePart.date).getTime();
      resultHash[messagePart.emailId].totalMessages++;
      if (ts > resultHash[messagePart.emailId].lastSeen) {
        resultHash[messagePart.emailId].timestamps.push(ts);
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }

  const result = Object.keys(resultHash).map((k) => resultHash[k]);

  res.status(200).json(result);
}
