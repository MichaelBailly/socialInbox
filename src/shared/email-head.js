export default class EmailHead {
  constructor({ _id, subject, from, to = null, cc = null, bcc = null, sentAt, receivedAt }) {
    this._id = _id;
    this.id = _id;
    this.subject = subject;
    this.from = from;
    this.to = to;
    this.cc = cc;
    this.bcc = bcc;
    this.sentAt = sentAt;
    this.sentAtTs = sentAt.getTime();
    this.receivedAt = receivedAt;
    this.receivedAtTs = receivedAt.getTime();
  }

  static fromEmail(email) {
    const emailHead = {
      subject: email.subject,
      from: email.from,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      sentAt: new Date(email.sentAt),
      receivedAt: new Date(email.receivedAt),
      _id: email.id,
    };

    return EmailHead.fromObject(emailHead);
  }

  static fromObject(object) {
    if (!object._id) {
      throw new Error('_id property is mandatory');
    }
    ensureRecipients(object.from, 'from');
    const to = object.to || [];
    ensureRecipients(to, 'to');
    const cc = object.cc || [];
    ensureRecipients(cc, 'cc');
    const bcc = object.bcc || [];
    ensureRecipients(bcc, 'bcc');
    const sentAt = new Date(object.sentAt);
    ensureDate(sentAt, 'sentAt');
    const receivedAt = new Date(object.receivedAt);
    ensureDate(receivedAt, 'receivedAt');
    const emailHeadData = {
      _id: object._id,
      subject: object.subject,
      sentAt,
      receivedAt,
      from: object.from,
    };
    if (object.to) {
      emailHeadData.to = to;
    }
    if (object.cc) {
      emailHeadData.cc = cc;
    }
    if (object.bcc) {
      emailHeadData.bcc = bcc;
    }

    return new EmailHead(emailHeadData);
  };
}

const ensureDate = (date, label) => {
  if (!date || !('getTime' in date)) {
    throw new Error(`${label} should be a valid date.`);
  }
};

const ensureRecipients = (recipients, label) => {
  if (!Array.isArray(recipients)) {
    throw new Error(`recipient ${label} should be an array.`);
  }
  const badRecipients = recipients.filter(r => {
    if (!r) {
      return true;
    }
    if (!r.email) {
      return true;
    }
    return false;
  });
  if (badRecipients.length) {
    throw new Error(`recipients should be object with an email property: ${JSON.stringify(badRecipients)}`);
  }
};
