import { EVENTS as EVENTS1 } from './chat-message/post';
import { EVENTS as EVENTS2 } from './email/labels-update';
import { EVENTS as EVENTS3 } from './email/share';
import { EVENTS as EVENTS4 } from './label/create';
import { EVENTS as EVENTS5 } from './automation';
import { EVENTS as EVENTS6 } from './email/initial-sync';
import { EVENTS as EVENTS7 } from './jwt';
import { EVENTS as EVENTS8 } from './email/sync';
import { EVENTS as EVENTS9 } from './email/label-add';
import { EVENTS as EVENTS10 } from './chat-message/last-seen-pointer-update';
import { EVENTS as EVENTS11 } from './task';
import { EVENTS as EVENTS12 } from './email/user-state';

export const eventsListeners = {};

Object.keys(EVENTS1).forEach((k) => (eventsListeners[k] = EVENTS1[k]));
Object.keys(EVENTS2).forEach((k) => (eventsListeners[k] = EVENTS2[k]));
Object.keys(EVENTS3).forEach((k) => (eventsListeners[k] = EVENTS3[k]));
Object.keys(EVENTS4).forEach((k) => (eventsListeners[k] = EVENTS4[k]));
Object.keys(EVENTS5).forEach((k) => (eventsListeners[k] = EVENTS5[k]));
Object.keys(EVENTS6).forEach((k) => (eventsListeners[k] = EVENTS6[k]));
Object.keys(EVENTS7).forEach((k) => (eventsListeners[k] = EVENTS7[k]));
Object.keys(EVENTS8).forEach((k) => (eventsListeners[k] = EVENTS8[k]));
Object.keys(EVENTS9).forEach((k) => (eventsListeners[k] = EVENTS9[k]));
Object.keys(EVENTS10).forEach((k) => (eventsListeners[k] = EVENTS10[k]));
Object.keys(EVENTS11).forEach((k) => (eventsListeners[k] = EVENTS11[k]));
Object.keys(EVENTS12).forEach((k) => (eventsListeners[k] = EVENTS12[k]));
