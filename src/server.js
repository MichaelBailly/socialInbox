import start from './backend/api-server';
import run from './backend/kafka/events/consumer';
import startConsummer from './backend/core/jmap/inbox-synchronizer';

start();
run();
startConsummer();
