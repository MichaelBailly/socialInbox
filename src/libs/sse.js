import { v4 as uuidv4 } from 'uuid';

let id;
let es;

const events = {};

export function connect() {
  id = id || uuidv4();
  if (es) {
    throw new Error('Event Source object already exist');
  }
  es = new EventSource(`/api/sse/${id}`);

  es.onerror = (err) => {
    console.error('EventSource failed:', err);
    try {
      es.close();
    } catch (e) {
      console.log('unable to close EventSource', e);
    }
    es = null;
    setTimeout(connect, 10000);
  };

  Object.keys(events).forEach((name) => {
    events[name].forEach((callback) => {
      es.addEventListener(name, callback);
    });
  });
}

export function registerEvent(name, callback) {
  if (!events[name]) {
    events[name] = [];
  }
  const callbackWrapper = createCallbackWrapper(name, callback);

  events[name].push(callbackWrapper);
  es && es.addEventListener(name, callbackWrapper);

  return () => {
    events[name] = events[name].filter((e) => e !== callbackWrapper);
    es && es.removeEventListener(name, callbackWrapper);
  };
}

const createCallbackWrapper = (name, callback) => {
  return (event) => {
    const payload = JSON.parse(event.data);
    console.log(`SSE: received ${name} event`, payload);
    callback(payload);
  };
};
