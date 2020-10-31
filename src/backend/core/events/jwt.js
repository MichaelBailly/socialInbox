import KafkaMessage from "../../kafka/kafka-message";
import send from "../../kafka/events/producer";

const JWT_EVENT = "jwt:token";

export default function jwtEvent(user, jwt) {
  const email = findUserEmail(user);
  const message = {
    event: JWT_EVENT,
    user: email,
    payload: {
      token: jwt,
    },
  };
  const kafkaMessage = KafkaMessage.fromObject(email, message);

  send(kafkaMessage);
}

function findUserEmail(user) {
  const accounts = [...user.accounts];
  const emails = [...accounts.shift().emails];
  return emails.shift();
}
