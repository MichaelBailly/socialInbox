const ACTOR_USER = 'user';
const ACTOR_AUTOMATION = 'automation';

export default class Actor {
  constructor({
    _id,
    origin = ACTOR_USER,
    email = null,
    displayName = null,
    firstname = null,
    lastname = null,
    name = null,
  }) {
    this._id = _id;
    this.origin = origin;
    if (email) {
      this.email = email;
    }
    if (displayName) {
      this.displayName = displayName;
    }
    if (firstname) {
      this.firstname = firstname;
    }
    if (lastname) {
      this.lastname = lastname;
    }
    if (name) {
      this.name = name;
    }

    if (this.origin === ACTOR_USER) {
      if (!this._id || !this.email) {
        throw new Error('Actor: user origin should have _id and email');
      }
    } else if (this.origin === ACTOR_AUTOMATION) {
      if (!this._id || !this.name) {
        throw new Error(
          'Actor: automation origin should have an idea and email'
        );
      }
    } else {
      throw new Error(`Actor: unknown origin ${origin}`);
    }
  }

  id() {
    return this._id;
  }

  get dn() {
    if (this.displayName) {
      return this.displayName;
    }
    if (this.origin === ACTOR_USER) {
      if (this.firstname) {
        if (this.lastname) {
          return `${this.firstname} ${this.lastname}`;
        }
        return this.firstname;
      }
      if (this.lastname) {
        return this.lastname;
      }
      return this.email;
    }
    if (this.origin === ACTOR_AUTOMATION) {
      return this.name;
    }
  }

  static fromObject(object) {
    return new Actor(object);
  }

  static fromUser(user) {
    return Actor.fromObject({ ...user, origin: 'user' });
  }
}
