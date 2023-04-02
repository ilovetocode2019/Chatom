import { EventSourcePolyfill } from 'event-source-polyfill';

export default function connect(token) {
  console.log('Subscribing to server-sent events...');
  const url = import.meta.env.VITE_API_BASE_URL + '/events';

  const source = new EventSourcePolyfill(url, {
    headers: {'Authorization': `Bearer ${token}`}
  });

  source.onopen = (event) => {
    console.log("Subscribed to server-sent events.");
  }
}
