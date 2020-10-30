import login from '../../core/openpaas/login';

const { OPENPAAS_URL } = process.env;

export default function(server) {
  server.post('/api/login', async (req, res) => {
    if (!req.body || !req.body.username || (typeof req.body.username) !== 'string') {
      return res.status(400).json({ error: 'username should be a string'});
    }
    if (!req.body || !req.body.password || (typeof req.body.password) !== 'string') {
      return res.status(400).json({ error: 'password should be a string' });
    }

    try {
      const user = await login(OPENPAAS_URL, req.body.username, req.body.password);
      res.status(200).json({ user });
    } catch (e) {
      res.status(401).json({error: e.message || e});
    }


  });
}
