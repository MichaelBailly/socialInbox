import { createLabel } from '../../../backend/core/commands/label';
import db from '../../../backend/mongodb';

export async function get(req, res) {
  const database = await db();
  const collection = database.collection('labels');
  const labels = await collection.find({}).sort({ name: 1 }).toArray();
  res.status(200).json(labels);
}

export async function post(req, res) {
  const currentUser = req.session.user;

  if (!req.body) {
    return res.status(400).json({ error: 'No body in POST request' });
  }
  if (!req.body.name || typeof req.body.name !== 'string') {
    return res
      .status(400)
      .json({ error: 'No name field in body POST request' });
  }
  if (!req.body.colorId || typeof req.body.colorId !== 'string') {
    return res
      .status(400)
      .json({ error: 'No colorId field in body POST request' });
  }
  if (!req.body.description || typeof req.body.description !== 'string') {
    return res
      .status(400)
      .json({ error: 'No description field in body POST request' });
  }
  const label = {
    name: req.body.name,
    description: req.body.description,
    colorId: req.body.colorId,
  };

  createLabel(label, currentUser);
}
