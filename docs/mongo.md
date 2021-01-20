# Documents
## User information

- collection: userinfos

### Document structure

```javascript
{
  _id: String, // user id
  email: String, // user email
  token: String, // JWT token
  activity: [], // information on what happened that this user did and that is not related to an email
}
```

## Main (email) table

- collection: emails

### Document structure

```javascript
{
  _id: String, // id of the email (JMAP id)
  users: [String], // id of users having this email visible because directly in their Inbox
  usersShared: [String], // id of users having the email visible because it has been shared with them
  activity: [ // information on what happened around this email
    {
      name: String, // activity name
      date: Date, // date of the share
      ... // other fields depending on the activity
    }
  ],
  labels: [], // labels stored
  email: Object, // the email, in JMAP format
  lastModified: Date, // the date of the **receivedAt** JMAP email field
  userState: { // per-user state on this email
    [userId]: { // key is the user ID String
      seen: Boolean // set whether the email is "seen" or "unseen" for this user
    }
  }
}
```

## Label

- collection: labels

### document structure

```javascript
{
  "_id": ObjectId,
  "name": String, // label name
  "description": String, //label scription
  "colorId": String // (ex: "6" , the id of the color. frontend resolves to CSS class(es)
}
```

## Automation

- collection: automations

### Document Structure

```javascript
{
  _id: ObjectId,
  name: String, //automation name
  description: String, // automation description
  trigger: ActivityTrigger, // the trigger definition
  actions: [ActivityAction], // the actions to perform
}
```

## ChatMessage

- collection: chatMessages

### Document Structure

```javascript
{
  _id: ObjectId,
  emailId: UUIDv4, // reference to this message email
  user: userProj,
  uuid: UUIDv4, // client sent uuid
  body: String, // message contents
  date: Date, // message post date
}
```

## tasks

- collection: emails. property: tasks

### structure

```javascript
{
  _id: ObjectId,
  emailId: String,
  creator: Actor,
  assignee: Actor,
  deadline: {
    date: Date,
    count: Integer
    scale: Set['hour', 'day', 'week']
  },
  description: String,
  done: Boolean,
  date: Date,
}
```

# Activities

Activities are logs of what changed on the system.

## share

The email has been shared with a new person
```javascript
{
  name: 'email:share', // activity reserved name
  actor: Object, // userProj of the person who shared the email
  target: Object, // userProj of the person who received the email
  date: Date // date when the sharing happened
}
```

## label:created

A label has been created
```javascript
{
  name: "label:created",
  actor: {
    _id: "599aefa0a310ed32d28d52e6",
    email: "usera@acme.org",
    displayName: null,
    firstname: "User",
    lastname: "A",
    automation: null
  },
  label: {
    _id: "5faba579975f3c775660653f",
    name: "Important Stuff",
    description: "Stuff that matters",
    colorId: "6"
  },
  date: "2020-11-11T08:48:57.767Z"
}
```

## email:label:added

A label had been set on an email

```javascript
{
  name: 'email:label:added',
  actor: {
    _id: '599aefa0a310ed32d28d52e6',
    email: 'usera@acme.org',
    displayName: null,
    firstname: 'User',
    lastname: 'A',
    automation: null
  },
  emailId: 'e184c8c0-2300-11eb-9c54-31d2448991c3',
  label: {
    _id: ObjectId("5fa81e2a320bbda32006c1b3"),
    name: 'sdfsdf',
    colorId: '6'
  },
  date: 2020-11-10T14:20:35.699Z
}
```

# Generic data structures

## userProj

```javascript
{
  _id: String, // user id
  email: String, // user email
  firstname: String(optional), //user firstname
  lastname: String(optional),  // user lastname
  displayName: String(optional) // user displayName
}
```

## ActivityTrigger

```javascript
{
  processor: String, // name of the trigger processor
  value: String, // trigger processor argument
}
```

## ActivityAction

```javascript
{
  processor: String, // name of the action processor
  value: Any, // action processor argument (most likely an array)
}
