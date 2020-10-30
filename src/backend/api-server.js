import sirv from 'sirv';
import * as sapper from '@sapper/server';
import express from 'express';
import loginPost from './routes/proxy/login-post';
import session from 'express-session';
import sessionFileStore from 'session-file-store';



const { PORT, NODE_ENV, OPENPAAS_URL } = process.env;
const dev = NODE_ENV === 'development';

if (!OPENPAAS_URL) {
  console.log('OPENPAAS_URL is mandatory');
  process.exit(1);
}

async function start() {
  const server = express();

  server.use(express.json());

  loginPost(server);

  server.use(
    sirv('static', { dev }),
    sapper.middleware({
      session: req => ({
        user: req.session && req.session.user
      })
    })
  );
  // server.use('/app', sapper.middleware());
  server.listen(PORT);
}

export default start;

function getSessionMiddleware() {
  const FileStore = sessionFileStore(session);

  const sessionInstance = session({
    secret: 'the-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 31536000
    },
    store: new FileStore({
      path: dev ? `.sessions` : `/tmp/sessions`
    })
  });
}
