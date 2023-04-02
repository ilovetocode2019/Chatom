import { createSignal, createContext, useContext, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import { createMediaQuery } from "@solid-primitives/media";

import Box from '@suid/material/Box';

import connect from '../lib/events';

import Conversation from './Conversation';
import NewConveration from './NewConversation';
import NotificationRequest from './NotificationRequest';
import Settings from './Settings';
import Sidebar from './Sidebar';

const StateContext = createContext();

function Home() {
  const [state, setState] = createStore({
    users: {
      1: {
        id: 1,
        username: 'Example User'
      },
      2: {
        id: 2,
        username: 'Example User 2'
      },
      3: {
        id: 3,
        username: 'Example User 3'
      }
    },
    conversations: {
      1: {
        id: 1,
        members: {
          1: {
            user_id: 1
          }
        }
      },
      2: {
        id: 2,
        members: {
          2: {
            user_id: 2
          }
        }
      },
      3: {
        id: 3,
        members: {
          3: {
            user_id: 3
          }
        }
      }
    }
  });

  const [currentConversation, setCurrentConversation] = createSignal();

  const [showSettings, setShowSettings] = createSignal(false);
  const [newConversation, setNewConversation] = createSignal(false); 
  const [notificationPreference, setNotificationPreference] = createSignal(localStorage.getItem('notificationPreference'));

  const isMobile = createMediaQuery("(max-width: 700px)");

  let sidebarRef;
  let conversationRef;

  const setConversation = (conversation) => {
    setCurrentConversation(conversation);
    conversationRef?.scrollIntoView({behavior: 'smooth'});
  }

  const closeConversation = () => {
    sidebarRef.scrollIntoView({behavior: 'smooth'});
  }

  const enableNotifications = () => {
    Notification.requestPermission().then(permission => {
      if (permission == 'granted') {
        navigator.serviceWorker?.getRegistration().then((registration) => {
          if (registration && 'pushManager' in registration) {
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID)
            })
            .then((subscription) => {
              console.log('Retrieved push endpoint: ' + subscription.endpoint);
              this.api.post('/push', {
                endpoint: subscription.endpoint,
                p256dh: subscription.toJSON().keys.p256dh,
                auth: subscription.toJSON().keys.auth
              })
              .catch(error => {
                this.setState({error: 'Failed to subscribe to push notifications.'});
              })
            });
          }
        });

        localStorage.setItem('notificationPreference', 'enabled');
        setNotificationPreference('enabled');
      } else {
        localStorage.setItem('notificationPreference', 'disabled');
        setNotificationPreference('disabled');
      }
    });
  }

  const disableNotifications = () => {
    navigator.serviceWorker?.getRegistration().then((registration) => {
      if (registration && 'pushManager' in registration) {
        registration.pushManager.unsubscribe()
        .then((subscription) => {
        })
        .catch(error => {
          this.setState({error: 'Failed to ubsubscribe from push notifications.'});
        })
      }
    });

    localStorage.setItem('notificationPreference', 'disabled');
    setNotificationPreference('disabled');
  }

  const source = connect(localStorage.getItem('token'));

  return (
    <div class='home'>
      <StateContext.Provider value={[state, setState]}>
        <Show when={notificationPreference() === null}>
          <NotificationRequest yes={enableNotifications} no={disableNotifications}/>
        </Show>

        <Show when={newConversation()}>
          <NewConveration close={() => setNewConversation(false)} />
        </Show>

        <Show when={showSettings()}>
          <Settings close={() => setShowSettings(false)} />
        </Show>

        <Sidebar
        ref={sidebarRef}
        setConversation={setConversation}
        newConversation={() => setNewConversation(true)}
        showSettings={() => setShowSettings(true)}
        currentConversation={!(isMobile()) && currentConversation()}
        />

        <Show when={currentConversation()}>
          <Conversation
          ref={conversationRef}
          conversation={currentConversation()}
          exit={isMobile() && closeConversation}
          />
        </Show>

        <Show when={!(isMobile()) && !(currentConversation())}>
          <Box sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }}>
            <h3>Select a conversation to start texting</h3>
          </Box>
        </Show>

      </StateContext.Provider>
    </div>
  );
}

export default Home;
export function useState() { return useContext(StateContext); }
