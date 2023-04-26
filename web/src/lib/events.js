import { createStore } from "solid-js/store";
import { EventSourcePolyfill } from 'event-source-polyfill';

export default function connect(token) {
  const [state, setState] = createStore({users: {}, conversations: {}});

  console.log('Subscribing to server-sent events...');
  const url = import.meta.env.VITE_API_BASE_URL + '/events';

  const source = new EventSourcePolyfill(url, {
    headers: {'Authorization': `Bearer ${token}`}
  });

  source.onopen = (event) => {
    console.log("Subscribed to server-sent events.");
  }

  source.onmessage = (event) => {
    console.log('Received new message: ' + event.data);
    const message = JSON.parse(event.data);

    const e = message.e;
    const d = message.d;

    if (e === 1) {
      d.messages = {};
      setState(d);
    } else if (e === 3) {
      setState('conversations', d.id, d);
    } else if (e === 4) {
      if (d.conversation_id in state.messages) {
        setState('messages', d.conversation_id, d.id, d);
      }
    } else if (e === 5) {
      setState('users', d.id, d);
    }
  }

  source.onerror = (event) => {
    console.error('Server-sent events error with status code ' + event.status);

    if (event.status === 401) {
      console.log('Token is invalid or expired. Logging out and redirecting to login page.');
    } else {
      console.warn('Unknown disconnect reason. Attempting to reconnect.');
    }
  }

  return [state, setState];
}
