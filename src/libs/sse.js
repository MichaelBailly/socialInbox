import { v4 as uuidv4 } from 'uuid';

let id;
let es;

export function connect() {
  id = id || uuidv4();
  if (es) {
    throw new Error('Event Source object already exist');
  }
  es = new EventSource(`/api/sse/${id}`);

  es.addEventListener('ping', (event) => {
    const payload = JSON.parse(event.data);
    console.log('SSE: received ping event', payload);
  });

  es.onerror = (err) => {
    console.error('EventSource failed:', err);
    try {
      es.close();
    } catch (e) {
      console.log('unable to close EventSource', e);
    }
    es = null;
  };
}
