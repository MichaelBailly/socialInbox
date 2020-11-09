import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import EmailShareActivity from '../../../shared/email-share-activity';
import UserProj from '../../../shared/user-proj';
import logger from '../logger';

const debug = logger.extend('commands:email');

/*
 * user: {_id, email} connected user
 * email: Obj, email to share
 * actor: userProj the user sharing the email
 * target: userProj: the user for who the mail is shared
 */
export function addShare(user, email, actor, target) {
  const actorProj = UserProj.fromObject(actor);
  const targetProj = UserProj.fromObject(target);
  const activity = new EmailShareActivity(actorProj, targetProj);

  console.log('Going to push to Kafka:', activity, JSON.stringify(activity));

  const message = {
    event: activity.name,
    user,
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

export async function setLabels(user, email, labels) {
  const userProj = UserProj.fromObject(user);

  const message = {
    event: 'email:labels:update',
    user: userProj,
    payload: {
      emailId: email._id,
      labels: labels.map((l) => ({
        _id: l._id,
        name: l.name,
        colorId: l.colorId,
      })),
    },
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(user._id, message);

  await sendEvent(kafkaMessage);
}
