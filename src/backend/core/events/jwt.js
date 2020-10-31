import KafkaMessage from '../../kafka/kafka-message';
import send from '../../kafka/events/producer';
import db from '../../mongodb/index';
import logger from '../logger/index';

const debug = logger.extend('events:jwt');

const JWT_EVENT = 'jwt:token';

export default function jwtEvent(userEmail, jwt) {
  const message = {
    event: JWT_EVENT,
    user: userEmail,
    payload: {
      token: jwt,
    },
  };
  const kafkaMessage = KafkaMessage.fromObject(userEmail, message);

  send(kafkaMessage);
}

export async function jwtTokenReceiver(kafkaMessage) {
  debug('storing JWT token in datastore');
  const database = await db();

  const collection = database.collection('userinfos');
  const response = await collection.updateOne(
    { _id: kafkaMessage.user() },
    {
      $set: {
        _id: kafkaMessage.user(),
        token: kafkaMessage.payload().token,
      },
    },
    {
      upsert: true,
    }
  );
  if (response.upsertedCount !== 1) {
    debug('jwtTokenReceiver token storage failed: %O', response);
  }
}
