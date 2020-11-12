import CONSTANTS from '../constants';
import { MongoClient } from 'mongodb';
import logger from '../core/logger';

const debug = logger.extend('mongodb');

let dbPromise;

const db = async () => {
  const client = await getDbPromise();

  return client.db(CONSTANTS.MONGODB.DATABASE);
};

const getDbPromise = () => {
  if (!dbPromise) {
    const client = new MongoClient(CONSTANTS.MONGODB.CONNECTION, {
      useUnifiedTopology: true,
    });
    dbPromise = client.connect();
    dbPromise
      .then(() => debug('connected to server'))
      .catch((e) => {
        debug('problem connecting to server: %O', e);
      });
  }
  return dbPromise;
};

export default db;

/**
 * @param {String} name MongoDB collection name
 * @returns {Promise<import("mongodb").Collection>}
 */
export async function dbCol(name) {
  const database = await db();
  return database.collection(name);
}
