import logger from '../logger/index';
import { fetchAccount } from './requests/account';
import { getInboxId } from './requests/inbox';
import { fetchEmails, fetchNewestEmails } from './requests/emails';
import KafkaMessage from '../../kafka/kafka-message';
import { parseISO, sub, isBefore } from 'date-fns';
import sendEvent from '../../kafka/events/producer';
import CONSTANTS from '../../constants';
import { dbCol } from '../../mongodb';

const COLLECTION_NAME = 'jmapSynchronizers';
export default class JmapSynchronizer {
  constructor({ jmapSessionURL, jmapURL, token, user }) {
    this.jmapSessionURL = jmapSessionURL;
    this.jmapURL = jmapURL;
    this.token = token;
    this.user = user;
    this.debug = logger.extend(
      `synchronizer[${this.user._id}/${this.user.email}]`
    );

    this.accountId = null;
    this.inboxId = null;

    // state
    this.running = false;
    this.initialSync = false;
    this.error = null;
    this.periodicSyncId;
  }

  async start() {
    if (this.running) {
      return false;
    }

    this.running = true;

    await this.initJmapServerConnection();

    // handle initial synchronization
    const initialSync = this.doInitialSync();
    if (!initialSync) {
      this.debug('initial sync failed. Stopping here');
      this.stop();
      return false;
    }

    this.startPeriodicSync();
  }

  async startPeriodicSync() {
    if (this.periodicSyncId) {
      this.debug('Periodic sync already running, stopping here');
      return;
    }
    this.periodicSyncId = setTimeout(async () => {
      try {
        await this.syncNewest(true);
      } catch (e) {
        this.debug('Error during periodic sync: %s %s', e.message, e.stack);
      }
      this.periodicSyncId = null;
      this.startPeriodicSync();
    }, CONSTANTS.JMAP.PERIODIC_SYNC_INTERVAL);
  }

  newestDate(reference, a) {
    let newest = reference;
    if (!a.length) {
      return reference;
    }

    a.forEach((email) => {
      const emailDate = parseISO(email.receivedAt);
      if (!newest) {
        newest = emailDate;
      } else {
        newest = isBefore(newest, emailDate) ? emailDate : newest;
      }
    });

    return newest;
  }

  async syncNewest() {
    const lastSyncDate = await this.getLastSyncDate(this.user._id);
    if (!lastSyncDate) {
      this.debug('Well, no lastSyncDate. Stopping here');
      return false;
    }

    const date = lastSyncDate.toISOString();
    this.debug('LastSyncDate=%s', date);

    let position = 0;
    const limit = CONSTANTS.JMAP.SYNC_EMAILS_PER_REQUESTS;
    let endLoop = false;
    let newestSyncDate;

    this.debug('####### starting sync loop');

    while (!endLoop) {
      const emails = await fetchNewestEmails(
        this.jmapURL,
        this.token,
        this.accountId,
        this.mailboxId,
        date,
        position,
        limit
      );

      newestSyncDate = this.newestDate(newestSyncDate, emails);

      if (!emails.length) {
        endLoop = true;
      } else {
        const kafkaMessages = emails.map((email) => {
          return KafkaMessage.fromObject(this.user._id, {
            user: this.user,
            event: 'email:sync',
            payload: email,
          });
        });
        try {
          await sendEvent(kafkaMessages);
        } catch (e) {
          this.debug(
            'some messages could not be sent on Kafka: %s %s',
            e.message,
            e.stack
          );
        }
      }

      position = position + limit;
    }
    this.debug('###### end of sync loop');
    if (newestSyncDate) {
      await this.storeLastSyncDate(this.user._id, newestSyncDate);
    }
  }

  async doInitialSync() {
    const initialSync = await this.getInitialSyncStatus(this.user._id);
    if (initialSync === false) {
      return false;
    }
    if (!initialSync) {
      const newestEmailDate = await this.launchInitialSync(
        this.accountId,
        this.inboxId
      );
      return await this.storeInitialState(this.user._id, newestEmailDate);
    }

    return true;
  }

  async initJmapServerConnection() {
    this.debug('fetch account id');
    let accountId;
    try {
      accountId = await fetchAccount(this.jmapSessionURL, this.token);
      this.accountId = accountId;
    } catch (e) {
      this.debug('failed to fetch accountId: %O', e);
      return this.stop(e);
    }
    this.debug('got account id: %s', this.accountId);

    this.debug('fetch inbox id');
    let inboxId;
    try {
      inboxId = await getInboxId(this.jmapURL, this.token, this.accountId);
      this.inboxId = inboxId;
    } catch (e) {
      this.debug('failed to fetch inboxId: %O', e);
      return this.stop(e);
    }
    this.debug('got inboxId: %s', this.inboxId);
    return true;
  }

  async launchInitialSync(accountId, mailboxId) {
    this.initialSync = true;
    // get the mails ordered by receivedAt desc and stop
    // on mails being 1m+ old
    const initialSyncStartDate = sub(
      new Date(),
      CONSTANTS.JMAP.INITIAL_SYNC_PERIOD
    );
    let position = 0;
    const limit = CONSTANTS.JMAP.SYNC_EMAILS_PER_REQUESTS;
    let endLoop = false;
    let newestEmailDate;

    this.debug('starting initial sync, %i', position);

    while (!endLoop) {
      this.debug(`fetching emails, position=${position}, limit=${limit}`);
      const emails = await fetchEmails(
        this.jmapURL,
        this.token,
        accountId,
        mailboxId,
        position,
        limit
      );

      // detect very first initialSync email
      if (position === 0) {
        if (!emails.length) {
          newestEmailDate = new Date();
        } else {
          newestEmailDate = parseISO(emails[0].receivedAt);
        }
      }

      const kafkaMessages = emails
        .filter((email) => {
          const date = parseISO(email.receivedAt);
          if (isBefore(date, initialSyncStartDate)) {
            this.debug('email is more that one month ago old, ignoring');
            endLoop = true;
            return false;
          }
          return true;
        })
        .map((email) => {
          return KafkaMessage.fromObject(this.user._id, {
            user: this.user,
            event: 'email:initial-sync',
            payload: email,
          });
        });

      if (kafkaMessages.length) {
        this.debug(
          'sending %i mails to kafka (event=email:initial-sync)',
          kafkaMessages.length
        );
        sendEvent(kafkaMessages);
      } else {
        endLoop = true;
      }
      position = position + limit;
    }

    this.debug('initial synchronization complete');
    this.debug('Newest email date %s', newestEmailDate);
    this.initialSync = false;
    return newestEmailDate;
  }

  stop(err) {
    this.running = false;
    this.error = err;
  }

  async getLastSyncDate(userId) {
    const collection = await dbCol(COLLECTION_NAME);
    const statusDoc = await collection.findOne({ _id: userId });
    if (!statusDoc) {
      return null;
    }
    return statusDoc.lastSync || statusDoc.initialSync;
  }

  async storeLastSyncDate(userId, date) {
    this.debug('storing last sync date: %s', date);
    const collection = await dbCol(COLLECTION_NAME);
    const response = await collection.updateOne(
      { _id: userId },
      {
        $set: { lastSync: date },
      }
    );
    // this.debug('store response: %O', response);
  }

  async getInitialSyncStatus(userId) {
    try {
      const collection = await dbCol(COLLECTION_NAME);
      const statusDoc = await collection.findOne({ _id: userId });
      if (!statusDoc) {
        return null;
      }
      return statusDoc.initialSync;
    } catch (e) {
      this.debug('Error recording initial state: %s %s', e.message, e.stack);
      return false;
    }
  }

  async storeInitialState(userId, date) {
    try {
      const collection = await dbCol(COLLECTION_NAME);
      collection.insertOne({ _id: userId, initialSync: date });
    } catch (e) {
      this.debug('Error recording initial state: %s %s', e.message, e.stack);
      return false;
    }
    return true;
  }
}
