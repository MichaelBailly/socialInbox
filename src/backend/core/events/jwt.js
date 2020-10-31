import KafkaMessage from '../../kafka/kafka-message';
import send from '../../kafka/events/producer';

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

export function jwtTokenReceiver(topic, partition, message) {
  console.log('here !');
}
