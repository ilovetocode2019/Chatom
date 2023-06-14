import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { EventSourcePolyfill } from 'event-source-polyfill';

export default class Connection {
  constructor() {
    [this.connected, this.setConnected] = createSignal(false);
    [this.state, this.setState] = createStore();
    [this.messages, this.setMessages] = createStore({});

    this.logout = null;
    this.backoff = 0.5;
  }

  initate = () => {
    const url = import.meta.env.VITE_API_BASE_URL + '/events';

    const source = new EventSourcePolyfill(url, {
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });

    source.onopen = () => {
      console.log("Subscribed to server-sent events.");
      this.backoff = 0.5;
    }

    source.onmessage = (event) => {
      console.log('Received new message: ' + event.data);
      const message = JSON.parse(event.data);

      const e = message.e;
      const d = message.d;

      if (e === 1) {
        d.messages = {};
        this.setState(d);
        this.setConnected(true);
      } else if (e === 3) {
        this.setState('conversations', d.id, d);
      } else if (e === 4) {
        if (d.conversation_id in this.state.messages) {
          this.setState('messages', d.conversation_id, d.id, d);
        }
      } else if (e === 5) {
        this.setState('users', d.id, d);
      }
    }

    source.onerror = (event) => {
      source.close();

      if (event.status === 401) {
        console.log('Token is invalid or expired. Logging out and redirecting to login page.');
        this.logout();
      } else {
        console.warn('Unknown disconnect reason. Attempting to reconnect in ' + this.backoff + ' seconds.');
        this.setConnected(false);

        setTimeout(() => {
          if (this.backoff < 32) {
            this.backoff *= 2;
          }

          this.initate();
        }, (this.backoff + Math.random()) * 1000);
      }
    }
  }
}
