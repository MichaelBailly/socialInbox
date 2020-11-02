import login from '../../backend/core/openpaas/login';
import getJWT from '../../backend/core/openpaas/jwt';
import jwtEvent from '../../backend/core/events/jwt';
import logger from '../../backend/core/logger';

const debug = logger.extend('login-post');

const { OPENPAAS_URL } = process.env;

export async function post(req, res) {
  if (
    !req.body ||
      !req.body.username ||
      typeof req.body.username !== 'string'
  ) {
    return res.status(400).json({ error: 'username should be a string' });
  }
  if (
    !req.body ||
      !req.body.password ||
      typeof req.body.password !== 'string'
  ) {
    return res.status(400).json({ error: 'password should be a string' });
  }

  try {
    const { user, headers } = await login(
      OPENPAAS_URL,
      req.body.username,
      req.body.password
    );
    const cookie = headers.get('set-cookie').split('; ').shift();
    const jwt = await getJWT(OPENPAAS_URL, cookie);
    let userEmail;
    try {
      userEmail = findUserEmail(user);
      user.email = userEmail;
      if (!userEmail) {
        debug('cannot login, email not found. USer object = %O', user);
        return res
          .status(400)
          .json({ error: 'no email found on OpenPaaS profile' });
      }
    } catch (e) {
      return res
        .status(500)
        .json({ error: e.message || e, details: e.stack || e });
    }
    req.session.user = user;
    res.status(200).json({ user });
    jwtEvent(userEmail, jwt);
  } catch (e) {
    res.status(401).json({ error: e.message || e, details: e.stack || e });
  }
};

function findUserEmail(user) {
  const accounts = [...user.accounts];
  const emails = [...accounts.shift().emails];
  return emails.shift();
}
