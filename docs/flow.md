- login

- get [user profile, jwt token]

- publish **jwt:token** event:

```javascript
{
  event: "jwt:token",
  user: "user1@test.io",
  payload: {
    token: "EAF2344...",
  },
}
```

- store token in MongoDB

- publish **jwt:token:store:success** notification:

```javascript
{
  event: "jwt:token:store:success",
  user: "user1@test.io",
  payload: {
    token: "EAF2344...",
  },
}
```

On **jwt:token:store:success** notification:

- email synchronize start
- fetch email from JMAP server
- send **email:initial-sync** event on each mail. Message:

```javascript
{
  event: "email:initial-sync",
  user: "user1@test.io",
  payload: { // this is the email, JMAP format
    "size": 485,
    "keywords": { "$seen": true },
    "blobId": "52d86560-199f-11eb-a677-2990b970028d",
    "mailboxIds": { "ec66ba50-18d8-11eb-a677-2990b970028d": true },
    "id": "52d86560-199f-11eb-a677-2990b970028d",
    "receivedAt": "2020-10-29T04:29:24Z",
    "references": null,
    "sender": [{ "name": "usera", "email": "usera@qa.open-paas.org" }],
    "subject": "From usera to userd 10",
    "inReplyTo": null,
    "replyTo": [{ "email": "usernnnnb@qa.open-paas.org" }],
    "messageId": ["Mime4j.5737.5f39d13fb28c3af6.175729e16a3@qa.open-paas.org"],
    "from": [{"name": "usera", "email": "usera@qa.open-paas.org" }],
    "sentAt": "2020-10-29T04:29:24Z",
    "to": [{"name": "userd@qa.open-paas.org", "email": "userd@qa.open-paas.org" } ],
    "textBody": [ { "partId": "1", "blobId": "52d86560-199f-11eb-a677-2990b970028d_1", "size": 10, "type": "text/html", "charset": "UTF-8" } ],
    "attachments": [],
    "htmlBody": [ { "partId": "1", "blobId": "52d86560-199f-11eb-a677-2990b970028d_1", "size": 10, "type": "text/html", "charset": "UTF-8" } ],
    "bodyValues": {
      "1": { "value": "<p>asd</p>", "isEncodingProblem": false, "isTruncated": false }
    },
    "preview": "asd",
    "hasAttachment": false
  },
}
```

On **email:initial-sync** event:

- lookup for this email id in MongoDB.
  - it doesn't exist: add
  - it exists: ensure that the current user is in the user's list
    - the user is not in the users list: add the user in the users list
    - the user is in the user list: do nothing 


# Email sharing

publish **email:share** event

```
key is payload.sharee._id

{
  event: "email:share",
  user: {
    id: '599aefa0a310ed32d28d52e6',
    email: 'usera@qa.open-paas.org',
  },
  payload: {
    emailId: "52d86560-199f-11eb-a677-2990b970028d",
    sharer: {
      _id: '599aefa0a310ed32d28d52e6',
      email: 'usera@qa.open-paas.org',
      displayName: null,
      firstname: 'User',
      lastname: 'A'
    },
    sharee: {
      _id: '5975f3e037cd7772785f0d42',
      email: 'useralpha@qa.open-paas.org',
      displayName: null,
      firstname: null,
      lastname: null
    }
  }
}
```

On this event reception, the Mongo emails codument is updated. Then, a notification **email:shared** is sent.

```
key is payload.sharee._id

{
  event: "email:shared",
  user: {
    id: '599aefa0a310ed32d28d52e6',
    email: 'usera@qa.open-paas.org',
  },
  payload: {
    emailId: "52d86560-199f-11eb-a677-2990b970028d",
    sharer: {
      _id: '599aefa0a310ed32d28d52e6',
      email: 'usera@qa.open-paas.org',
      displayName: null,
      firstname: 'User',
      lastname: 'A'
    },
    sharee: {
      _id: '5975f3e037cd7772785f0d42',
      email: 'useralpha@qa.open-paas.org',
      displayName: null,
      firstname: null,
      lastname: null
    }
  }
}
```

# Generic code flow for CUD

## 1/ request comes from API (routes/api)

The API files should ensure:

* user authenticated (if necessary)
* create the action POJO, if possible from **shared/somefile.js**
* CREATE THE OBJECTID if needed (no automatic object id from datastore or the event stream won't replay)
* Then call **backend/core/commands/\***
* Then answer most likely a HTTP 202 with
  * `{ _id: String(OjbecitId) }` for created resource
  * other info for update/delete

## 3/ **backend/core/commands**

the objective of this file if to push the event on kafka event topic (through **backend/kafka/events/producer** helper)

This function:
* is not allowed to read the datastore (CQRS principle)
* should make sure the event data structure is correct
* publish the event in Kafka

## 4/ **backend/core/events**

Those files defines listeners for KafKa event topic (events pushed in 3/).

Their initial binding to kafka is in **backend/kafka/events/consumer.js**. They receive a kafkaMessage

Algorithm

* do whatever update is needed in the datastore
* create an activity
* (maybe) push activity to kafta notification topic  
  there is an helper for that in **backend/activity**

## 5/ SSE binding

### Server (to send events in SSE stream)

SSE listens on Kafka **notification topic**. Event name trapping and appropriate publish function (the clients for who the event is sent or not) id done in **routes/api/sse/[clientId].js**

### Client (to receive events in SSE stream)

The function registerEvent of **libs/sse.js** is to be called. It returns an unsubscribe function.
