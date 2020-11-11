import { dbCol } from '../../mongodb';

export async function getUsers() {
  const collection = await dbCol('userinfos');

  return await collection.find({}).toArray();
}
