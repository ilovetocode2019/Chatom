import { createSignal, onMount } from 'solid-js';
import AppBar from '@suid/material/AppBar';
import ArrowBackIcon from '@suid/icons-material/ArrowBack';
import IconButton from '@suid/material/IconButton';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';

import { useState } from './Home';

export default function Conversation(props) {
  const [state, api] = useState();

  const members = () => Object.keys(state.conversations[props.conversation].members);
  const username = () => state.users[members()[0] !== state.id || members().length == 1 ? members()[0] : members()[1]].username;
  const messages = () => Object.values(state.messages[props.conversation]);

  const onScroll = (event) => {
    if (event.target.scrollTop < window.innerHeight) {
      console.log('Loading more messages...');
      
    }
  }

  return (
    <div ref={props.ref} class='conversation'>
      <AppBar position='sticky'>
        <Toolbar>
          <Show when={props.exit}>
            <IconButton
            onClick={props.exit}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{mr: 2, position: 'absolute'}}
            >
              <ArrowBackIcon />
            </IconButton>
          </Show>

          <Typography variant="h6" component="div" sx={{flexGrow: 1, textAlign: 'center'}}>
            {username()}
          </Typography>
        </Toolbar>
      </AppBar>

      <div class='messages' onScroll={onScroll}>
        <For each={messages()}>{(message, i) =>
          <Message message={message} next={messages()[i()+1]} />
        }</For>
      </div>

      <ConversationInput conversation={props.conversation} />
    </div>
    );
}

function Message(props) {
  const [state, api] = useState();

  return(
    <div class={props.message.author_id === state.id ? 'mine message-container' : 'yours message-container'}>
      <div class={props.next?.author_id !== props.message.author_id ? 'message last' : 'message'}>
        {props.message.content}
      </div>
    </div>
  );
}

function ConversationInput(props) {
  const [state, api] = useState();
  const [value, setValue] = createSignal('');

  const onSubmit = (event) => {
    event.preventDefault();
    api.post(`/conversations/${props.conversation}/messages`, {content: value()});
    setValue('');
  }

  return(
    <form onSubmit={onSubmit}>
      <input
      className='message-input'
      type='text'
      placeholder='Write a message..'
      value={value()}
      onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
