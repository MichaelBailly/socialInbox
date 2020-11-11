import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import sendNotification from '../../kafka/notifications/producer';
import db from '../../mongodb/index';
import logger from '../logger/index';

const debug = logger.extend('events:jwt');

const JWT_EVENT = 'jwt:token';

export default function jwtEvent(user, jwt) {
  const message = {
    event: JWT_EVENT,
    user: user,
    payload: {
      token: jwt,
    },
  };
  const kafkaMessage = KafkaMessage.fromObject(user._id, message);

  sendEvent(kafkaMessage);
}

export async function jwtTokenReceiver(kafkaMessage) {
  let notificationMessage;
  const user = kafkaMessage.user();
  try {
    debug('storing JWT token in datastore');
    const database = await db();
    const collection = database.collection('userinfos');
    const recordedUser = await collection.findOne({ _id: user._id });
    const updateDoc = {
      _id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      displayName: user.displayName,
      token: kafkaMessage.payload().token,
    };

    if (!recordedUser) {
      updateDoc.activity = [];
    }

    const response = await collection.updateOne(
      { _id: user._id },
      {
        $set: updateDoc,
      },
      {
        upsert: true,
      }
    );
    if (
      response.upsertedCount !== 1 &&
      response.modifiedCount !== 1 &&
      response.matchedCount !== 1
    ) {
      debug('jwtTokenReceiver token storage failed: %O', response);
      throw new Error(
        'jwtTokenReceiver token storage failed: mongo upsertedCount is !== 1'
      );
    } else {
      notificationMessage = kafkaMessage.setEvent(
        `${kafkaMessage.event()}:store:success`
      );
    }
  } catch (e) {
    debug('jwtTokenReceiver token storage failed: %O', e);
    notificationMessage = kafkaMessage.setEvent(
      `${kafkaMessage.event()}:store:failed`
    );
  }

  sendNotification(notificationMessage);
}

export const EVENTS = {
  'jwt:token': jwtTokenReceiver,
};
