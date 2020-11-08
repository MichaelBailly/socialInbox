import { writable } from 'svelte/store';
import { get } from 'api';
import { registerEvent } from '../sse';

export const labels = writable([]);

export async function loadLabels() {
  try {
    const labelList = await get('/api/labels');
    labels.set(labelList);
  } catch (e) {
    console.log('Unable to get labels list');
  }
}

registerEvent('label:created', (payload) => {
  labels.update((list) => [...list, payload.label]);
});
