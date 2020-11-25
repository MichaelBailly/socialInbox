import { isActivity } from './activity';

export default class UserNotification {
  constructor({ activity, user, _id, seen, email, emailId }) {
    this.activity = activity;
    this.user = user;
    if (_id) {
      this._id = _id;
    }
    if (seen === true || seen === false) {
      this.seen = seen;
    } else {
      this.seen = false;
    }
    if (email) {
      this.email = email;
    }
    if (emailId) {
      this.emailId = emailId;
    }
  }

  static fromObject({ activity, user, _id = null, seen = false, email = null, emailId = null }) {
    if (!activity) {
      throw new Error('activity property is required');
    }
    if (!isActivity(activity)) {
      throw new Error('activity propert should be an valid activity object');
    }
    if (!user || !user.origin || !user._id) {
      throw new Error('user property should be a valid Actor');
    }

    return new UserNotification({
      activity,
      user,
      _id,
      seen,
      email,
      emailId,
    });
  }
}
