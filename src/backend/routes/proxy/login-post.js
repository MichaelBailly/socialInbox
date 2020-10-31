import login from '../../core/openpaas/login';
import getJWT from '../../core/openpaas/jwt';
import jwtEvent from '../../core/events/jwt';
import logger from '../../core/logger';

const debug = logger.extend('login-post');

const { OPENPAAS_URL } = process.env;

export default function loginPost(server) {
  server.post('/api/login', async(req, res) => {
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
      console.log(cookie);
      const jwt = await getJWT(OPENPAAS_URL, cookie);
      console.log('GOT JWT', jwt);
      console.log(user);
      let userEmail;
      try {
        userEmail = findUserEmail(user);
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
      res.status(200).json({ user });
      jwtEvent(userEmail, jwt);
    } catch (e) {
      res.status(401).json({ error: e.message || e, details: e.stack || e });
    }
  });
}

function findUserEmail(user) {
  const accounts = [...user.accounts];
  const emails = [...accounts.shift().emails];
  return emails.shift();
}
