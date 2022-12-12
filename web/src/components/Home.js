import React from 'react';
import MediaQuery from 'react-responsive';
import { Redirect } from 'react-router-dom';

import { EventSourcePolyfill } from 'event-source-polyfill';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

import api from '../lib/api';
import Conversation from './Conversation';
import NewConversation from './NewConversation';
import SideBar from './SideBar';

function Loading(props) {
  return(
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <CircularProgress />
      <h1>&nbsp;&nbsp;Chatom</h1>
    </Box>
  );
}

class Home extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        me: null,
        messages: {},
        disconnected: false,
        error: null,
        redirect: false,
        newConversation: false,
        currentConversation: null
      };
      this.api = api;
      this.api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  }

  componentWillMount() {
      this.connect();
  }

  componentDidMount() {
    if (!(window.Notification)) {
      return;
    }

    Notification.requestPermission();
  }

  connect() {
    console.log('Subscribing to server-sent events.');

    const url = process.env.REACT_APP_API_BASE_URL + '/events';
    const source = new EventSourcePolyfill(url, {
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });

      source.onopen = (event) => {
        console.log("Subscribed to server-sent events.");
        this.setState({disconnected: false});
      }

      source.onmessage = (event) => {
        console.log('Received new message: ' + event.data);
        const message = JSON.parse(event.data);

        const e = message.e;
        const d = message.d
        const i = message.i;

        if (e === 1) {
          this.setState({me: d});

        } else if (e === 3) {
          const me = this.state.me;
          me.conversations[d.id] = d;
          this.setState({me: me});

        } else if (e === 4) {
          if (d.conversation_id in this.state.messages) {
            const messages = this.state.messages;
            messages[d.conversation_id][d.id] = d;
            this.setState({messages: messages});
          }

          if (window.Notification && (document.visibilityState === 'hidden' || this.state.currentConversation !== d.conversation_id) && d.author_id !== this.state.me.id) {
            new Notification(this.state.me.users[d.author_id].username, {body: d.content}).onclick = (event) => {
              this.openConversation(d.conversation_id);
              window.focus();
            };
          }

        } else if (e === 5) {
          const me = this.state.me;
          me.users[d.id] = d;
          this.setState({me: me});
        }
      }

        source.onerror = (event) => {
          console.log('Server-sent event error with status code ' + event.status + '.');
          source.close();

          if (event.status === 401) {
            console.log('Token has expired. Logging out and redirecting to /login.');

            localStorage.removeItem('token');
            this.props.logout();
            this.setState({redirect: true});
          } else {
            console.warn('Unknown disconnect reason. Attempting to reconnect.');

            this.setState({disconnected: true});
            this.connect();
         }
        }
  }

  newConversation = (user, conversation) => {
    if (conversation.id in this.state.me.conversations) {
      return;
    }

    const me = this.state.me;
    me.users[user.id] = user;
    me.conversations[conversation.id] = conversation;
    this.setState({me: me})
  }

  openConversation = (conversation) => {
    if (conversation === this.state.currentConversation) {
      return;
    }
    this.api.get(`/conversations/${conversation}/messages`)
    .then(response => {
      const messages = {[conversation]: response.data};
      this.setState({messages: messages});
      })
    .catch(error => {
      if (conversation === this.state.currentConversation && !(conversation in this.state.messages)) {
        this.setState({currentConversation: null, error: 'Failed to load messages for this conversation.'});
      }
    });

    this.setState({currentConversation: conversation});
  }

  sendMessage = (conversation, content) => {
    this.api.post(`/conversations/${conversation}/messages`, {content: content})
    .then(response => {
      const messages = this.state.messages;
      messages[conversation][response.data.id] = response.data;
      this.setState({messages: messages});
    })
    .catch(error => {
      this.setState({error: 'Failed to send message.'});
    })
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to='/login' />;
    }

    if (!this.state.me) {
      return (
        <Loading />
      );
    }

    return (
      <div>
        {
        this.state.newConversation ? (
          <NewConversation
          api={this.api}
          submit={this.newConversation}
          close={() => this.setState({newConversation: false})}
          />
        ) : (
          null
        )}

        <Snackbar open={this.state.disconnected}>
          <Alert variant='filled' severity='warning'>
            Trying to reconnect...
          </Alert>
        </Snackbar>

        <Snackbar open={this.state.error !== null} autoHideDuration={4000} onClose={() => this.setState({error: null})}>
          <Alert variant='filled' severity='error'>
            {this.state.error}
          </Alert>
        </Snackbar>

        <MediaQuery minWidth={501}>
          <div className='home'>
            <SideBar
            me={this.state.me}
            currentConversation={this.state.currentConversation}
            openConversation={this.openConversation}
            newConversation={() => this.setState({newConversation: true})}
            />
            {this.state.currentConversation ? (
              <Conversation
              me={this.state.me}
              messages={this.state.messages[this.state.currentConversation]}
              api={this.api}
              currentConversation={this.state.currentConversation}
              sendMessage={this.sendMessage}
              />
            ) : (
              <Box sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)'
              }}>
                <h3>Select a conversation to start texting</h3>
              </Box>
            )}
          </div>
        </MediaQuery>

        <MediaQuery maxWidth={500}>

          {!(this.state.currentConversation) ? (
          <SideBar
          me={this.state.me}
          currentConversation={this.state.currentConversation}
          openConversation={this.openConversation}
          newConversation={() => this.setState({newConversation: true})}
          />
          ) : (
            null
          )}

          {this.state.currentConversation ? (
            <Conversation
            me={this.state.me}
            messages={this.state.messages[this.state.currentConversation]}
            api={this.api}
            currentConversation={this.state.currentConversation}
            sendMessage={this.sendMessage}
            exit={() => this.setState({currentConversation: null})}
            />
          ) : (
            null
          )}

        </MediaQuery>

      </div>
    );
  }
}

export default Home;
