import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import EmailShareActivity from '../../../shared/email-share-activity';
import Actor from '../../../shared/actor';
import logger from '../logger';

const debug = logger.extend('commands:email');

/*
 * user: {_id, email} connected user
 * email: Obj, email to share
 * actor: userProj the user sharing the email
 * target: userProj: the user for who the mail is shared
 */
export function addShare(user, email, actor, target) {
  const userProj = Actor.fromObject(user);
  const actorProj = Actor.fromObject(actor);
  const targetProj = Actor.fromUser(target);
  const activity = new EmailShareActivity(actorProj, targetProj);

  console.log('Going to push to Kafka:', activity, JSON.stringify(activity));

  const message = {
    event: activity.name,
    sender: userProj,
    payload: {
      emailId: email._id,
      actor: actorProj,
      target: targetProj,
    },
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(target._id, message);

  sendEvent(kafkaMessage);
}

export async function setLabels(actor, email, labels) {
  const message = {
    event: 'email:labels:update',
    sender: Actor.fromObject(actor),
    payload: {
      emailId: email._id,
      labels: labels.map((l) => ({
        _id: l._id,
        name: l.name,
        colorId: l.colorId,
      })),
    },
  };

  const kafkaMessage = KafkaMessage.fromObject(actor._id, message);
  debug('Sending event %s to kafka', message.event);
  await sendEvent(kafkaMessage);
}
