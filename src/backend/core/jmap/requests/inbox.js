import fetch from 'node-fetch';

export async function getInboxId(jmapUrl, token, accountId) {
  const response = await fetch(jmapUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json;jmapVersion=rfc-8621',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: getRequestBody(accountId),
  });

  const mailboxes = await response.json();
  const inbox = mailboxes.methodResponses[0][1].list.filter(mailbox => mailbox.role === 'inbox').pop();
  return inbox.id;
}

function getRequestBody(accountId) {
  return JSON.stringify({
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [['Mailbox/get', { accountId: accountId }, '0']],
  });
}
