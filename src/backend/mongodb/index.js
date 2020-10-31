import CONSTANTS from '../constants';
import { MongoClient } from 'mongodb';
import logger from '../core/logger';

const debug = logger.extend('mongodb');

let dbPromise;

const db = async () => {
  const client = await getDbPRomise();

  return client.db(CONSTANTS.MONGODB.DATABASE);
};

const getDbPRomise = () => {
  if (!dbPromise) {
    const client = new MongoClient(CONSTANTS.MONGODB.CONNECTION);
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
