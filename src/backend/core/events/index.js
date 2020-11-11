import { EVENTS as EVENTS1 } from './chat-message/post';
import { EVENTS as EVENTS2 } from './email/labels-update';
import { EVENTS as EVENTS3 } from './email/share';
import { EVENTS as EVENTS4 } from './label/create';
import { EVENTS as EVENTS5 } from './automation';
import { EVENTS as EVENTS6 } from './email-initial-sync';
import { EVENTS as EVENTS7 } from './jwt';

export const eventsListeners = {};

Object.keys(EVENTS1).forEach((k) => (eventsListeners[k] = EVENTS1[k]));
Object.keys(EVENTS2).forEach((k) => (eventsListeners[k] = EVENTS2[k]));
Object.keys(EVENTS3).forEach((k) => (eventsListeners[k] = EVENTS3[k]));
Object.keys(EVENTS4).forEach((k) => (eventsListeners[k] = EVENTS4[k]));
Object.keys(EVENTS5).forEach((k) => (eventsListeners[k] = EVENTS5[k]));
Object.keys(EVENTS6).forEach((k) => (eventsListeners[k] = EVENTS6[k]));
Object.keys(EVENTS7).forEach((k) => (eventsListeners[k] = EVENTS7[k]));
