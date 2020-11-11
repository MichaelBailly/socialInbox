export function requireUser(req, res) {
  if (!req.session || !req.session.user || !req.session.user._id) {
    res
      .status(401)
      .json({ error: 'Forbiden', details: 'Authenticated users only' });
    return false;
  }
  return req.session.user;
}
