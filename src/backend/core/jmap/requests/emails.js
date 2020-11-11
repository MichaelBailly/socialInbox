import fetch from 'node-fetch';

export async function fetchNewestEmails(
  jmapUrl,
  token,
  accountId,
  mailboxId,
  date,
  position = 0,
  limit = 20
) {
  const body = getRequestBodyForNewest(
    accountId,
    mailboxId,
    date,
    position,
    limit
  );
  const response = await fetch(jmapUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json;jmapVersion=rfc-8621',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  const jmapResponse = await response.json();
  const emails = jmapResponse.methodResponses[1][1].list;

  return emails;
}

export async function fetchEmails(
  jmapUrl,
  token,
  accountId,
  mailboxId,
  position = 0,
  limit = 20
) {
  const response = await fetch(jmapUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json;jmapVersion=rfc-8621',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: getRequestBody(accountId, mailboxId, position, limit),
  });
  const jmapResponse = await response.json();
  const emails = jmapResponse.methodResponses[1][1].list;

  return emails;
}

function getRequestBody(accountId, mailboxId, position, limit) {
  return JSON.stringify({
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/query',
        {
          accountId,
          filter: { inMailbox: mailboxId },
          sort: [{ property: 'receivedAt', isAscending: false }],
          position,
          limit,
        },
        '0',
      ],
      [
        'Email/get',
        {
          accountId,
          '#ids': {
            name: 'Email/query',
            path: '/ids',
            resultOf: '0',
          },
          properties: [
            'id',
            'blobId',
            'keywords',
            'size',
            'receivedAt',
            'messageId',
            'inReplyTo',
            'references',
            'sender',
            'from',
            'to',
            'cc',
            'bcc',
            'replyTo',
            'subject',
            'sentAt',
            'hasAttachment',
            'preview',
            'bodyValues',
            'textBody',
            'htmlBody',
            'attachments',
          ],
          bodyProperties: ['partId', 'blobId', 'size', 'type', 'charset'],
          fetchHTMLBodyValues: true,
        },
        '1',
      ],
    ],
  });
}

function getRequestBodyForNewest(accountId, mailboxId, after, position, limit) {
  return JSON.stringify({
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/query',
        {
          accountId,
          filter: { inMailbox: mailboxId, after },
          sort: [{ property: 'receivedAt', isAscending: false }],
          position,
          limit,
        },
        '0',
      ],
      [
        'Email/get',
        {
          accountId,
          '#ids': {
            name: 'Email/query',
            path: '/ids',
            resultOf: '0',
          },
          properties: [
            'id',
            'blobId',
            'keywords',
            'size',
            'receivedAt',
            'messageId',
            'inReplyTo',
            'references',
            'sender',
            'from',
            'to',
            'cc',
            'bcc',
            'replyTo',
            'subject',
            'sentAt',
            'hasAttachment',
            'preview',
            'bodyValues',
            'textBody',
            'htmlBody',
            'attachments',
          ],
          bodyProperties: ['partId', 'blobId', 'size', 'type', 'charset'],
          fetchHTMLBodyValues: true,
        },
        '1',
      ],
    ],
  });
}
