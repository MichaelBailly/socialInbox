import { writable } from 'svelte/store';
import { get, send } from 'api';
import { registerEvent } from '../sse';

export const labels = writable([]);

export async function loadLabels(fetchInstance) {
  try {
    const labelList = await send({ method: 'GET', path: '/api/labels', fetchInstance });

//    get('/api/labels');
    labels.set(labelList);
    return labelList;
  } catch (e) {
    console.log('Unable to get labels list');
  }

}

registerEvent('label:created', (payload) => {
  labels.update((list) => {
    const newList = [...list, payload.label];
    newList.sort((a, b) => a.name < b.name ? -1 : 1)
  });
});
