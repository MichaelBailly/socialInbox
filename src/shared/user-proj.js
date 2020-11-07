export default class UserProj {
  constructor(
    id,
    email,
    { displayName = null, firstname = null, lastname = null, automation = null }
  ) {
    this._id = id;
    this.email = email;
    this.displayName = displayName;
    this.firstname = firstname;
    this.lastname = lastname;
    this.automation = automation;
    if (!this._id || !this.email) {
      throw new Error('user project: id & email are mandatory');
    }
  }

  id() {
    return this._id;
  }

  static fromObject(userProj) {
    return new UserProj(userProj._id, userProj.email, {
      displayName: userProj.displayName,
      firstname: userProj.firstname,
      lastname: userProj.lastname,
      automation: userProj.automation,
    });
  }
}
