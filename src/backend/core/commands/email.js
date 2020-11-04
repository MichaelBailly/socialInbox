import KafkaMessage from '../../kafka/kafka-message';
import sendEvent from '../../kafka/events/producer';
import EmailShareActivity from '../../../shared/email-share-activity';
import UserProj from '../../../shared/user-proj';
import logger from '../logger';

const debug = logger.extend('commands:email');

/*
 * user: {_id, email} connected user
 * email: Obj, email to share
 * sharer: userProj the user sharing the email
 * sharee: userProj: the user for who the mail is shared
 */
export function addShare(user, email, sharer, sharee) {
  const sharerProj = UserProj.fromObject(sharer);
  const shareeProj = UserProj.fromObject(sharee);
  const activity = new EmailShareActivity(sharerProj, shareeProj);

  console.log('Going to push to Kafka:', activity, JSON.stringify(activity));

  const message = {
    event: activity.name,
    user: { id: user._id, email: user.email },
    payload: {
      emailId: email._id,
      sharerProj,
      shareeProj,
    },
  };
  debug('Publishing to Kafka %O', message);

  const kafkaMessage = KafkaMessage.fromObject(sharee._id, message);

  sendEvent(kafkaMessage);
}
