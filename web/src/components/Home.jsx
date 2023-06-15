import { createSignal, createContext, useContext, onMount, Show } from 'solid-js';
import { createMediaQuery } from "@solid-primitives/media";

import Box from '@suid/material/Box';

import api from '../lib/api';
import Connection from '../lib/events';

import Conversation from './Conversation';
import NewConveration from './NewConversation';
import NotificationRequest from './NotificationRequest';
import Settings from './Settings';
import Sidebar from './Sidebar';

const StateContext = createContext();

function Home(props) {
  const [currentConversation, setCurrentConversation] = createSignal();
  const [showSettings, setShowSettings] = createSignal(false);
  const [newConversation, setNewConversation] = createSignal(false);
  const [notificationPreference, setNotificationPreference] = createSignal(localStorage.getItem('notificationPreference'));

  const isMobile = createMediaQuery("(max-width: 500px)");

  let sidebarRef;
  let conversationRef;

  api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

  const openConversation = (conversation) => {
    api.get(`/conversations/${conversation}/messages`)
    .then(response => {
      connection.setState('messages', conversation, response.data);
      setCurrentConversation(conversation);
    })

    conversationRef?.scrollIntoView({behavior: 'smooth'});
  }

  const closeConversation = () => {
    sidebarRef.scrollIntoView({behavior: 'smooth'});
  }

  const addConversation = (conversation, user) => {
    connection.setState('users', user.id, user);
    connection.setState('conversations', conversation.id, conversation);
    openConversation(conversation.id);
  }

  const logout = () => {
    localStorage.removeItem('token');
    props.login(false);
  }

  const enableNotifications = () => {
    Notification.requestPermission().then((permission) => {
      if (permission == 'granted') {
        localStorage.setItem('notificationPreference', 'enabled');
        setNotificationPreference('enabled');
      } else {
        localStorage.setItem('notificationPreference', 'disabled');
        setNotificationPreference('disabled');
      }
    });
  }

  const disableNotifications = () => {
    localStorage.setItem('notificationPreference', 'disabled');
    setNotificationPreference('disabled');
  }

  const showNotification = (message) => {
    if (notificationPreference() === 'enabled' && (document.visibilityState === 'hidden' || message.conversation_id != currentConversation) && message.author_id !== connection.state.id) {
      new Notification(connection.state.users[message.author_id].username, {body: message.content}).onclick = () => {
        window.focus();
        openConversation(message.conversation_id);
      };
    }
  }

  const connection = new Connection();
  connection.logout = logout;
  connection.showNotification = showNotification;

  onMount(connection.initate);

  return (
    <div class='home'>
      <Show when={!(connection.connected())}>
        <div class='alert' type='warning'>
          Trying to connect...
        </div>
      </Show>

      <StateContext.Provider value={[connection.state, api]}>
        <Show when={notificationPreference() === null}>
          <NotificationRequest yes={enableNotifications} no={disableNotifications}/>
        </Show>

        <Show when={newConversation()}>
          <NewConveration
          submit={addConversation}
          close={() => setNewConversation(false)} />
        </Show>

        <Show when={showSettings()}>
          <Settings
          logout={logout}
          close={() => setShowSettings(false)}
          notificationPreference={notificationPreference}
          enableNotifications={enableNotifications}
          disableNotifications={disableNotifications}
          />
        </Show>

        <Sidebar
        ref={sidebarRef}
        setConversation={openConversation}
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
