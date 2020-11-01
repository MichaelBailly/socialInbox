import logger from '../logger/index';
import { fetchAccount } from './requests/account';
import { getInboxId } from './requests/inbox';
import { fetchEmails } from './requests/emails';
import KafkaMessage from '../../kafka/kafka-message';
import { parseISO, sub, isBefore } from 'date-fns';
import sendEvent from '../../kafka/events/producer';
import CONSTANTS from '../../constants';

export default class JmapSynchronizer {
  constructor({ jmapSessionURL, jmapURL, token, email }) {
    this.jmapSessionURL = jmapSessionURL;
    this.jmapURL = jmapURL;
    this.token = token;
    this.email = email;
    this.debug = logger.extend(`synchronizer[${this.email}]`);

    // state
    this.running = false;
    this.initialSync = false;
    this.error = null;
  }

  async start() {
    if (this.running) {
      return false;
    }

    this.running = true;

    this.debug('fetch account id');
    let accountId;
    try {
      accountId = await fetchAccount(this.jmapSessionURL, this.token);
    } catch (e) {
      this.debug('failed to fetch accountId: %O', e);
      return this.stop(e);
    }
    this.debug('got account id: %s', accountId);

    this.debug('fetch inbox id');
    let inboxId;
    try {
      inboxId = await getInboxId(this.jmapURL, this.token, accountId);
    } catch (e) {
      this.debug('failed to fetch inboxId: %O', e);
      return this.stop(e);
    }
    this.debug('got inboxId: %s', inboxId);

    this.launchInitialSync(accountId, inboxId);
  }

  async launchInitialSync(accountId, mailboxId, opts = {}) {
    this.initialSync = true;
    // get the mails ordered by receivedAt desc and stop
    // on mails being 1m+ old
    const oneMonthAgo = opts.oneMonthAgo || sub(new Date(), { months: 1 });
    const position = opts.position || 0;
    const limit = CONSTANTS.JMAP.SYNC_EMAILS_PER_REQUESTS;
    const emails = await fetchEmails(this.jmapURL, this.token, accountId, mailboxId, position, limit);
    let endLoop = false;

    this.debug('starting initial sync, %i', position);

    const kafkaMessages = emails.filter((email) => {
      const date = parseISO(email.receivedAt);
      if (isBefore(date, oneMonthAgo)) {
        console.log('email is more that one month ago old, ignoring');
        endLoop = true;
        return false;
      }
      return true;
    }).map((email) => {
      return KafkaMessage.fromObject(this.email, {
        user: this.email,
        event: 'email:initial-sync',
        payload: email,
      });
    });
    if (kafkaMessages.length) {
      this.debug('sending mails to kafka as events %i', kafkaMessages.length);
      sendEvent(kafkaMessages);
    }

    if (!endLoop && kafkaMessages.length) {
      await this.launchInitialSync(accountId, mailboxId, {
        oneMonthAgo,
        position: position + limit,
      });
    }
    this.debug('initial synchronization complete');
    this.initialSync = false;
  }

  stop(err) {
    this.running = false;
    this.error = err;
  }
}
