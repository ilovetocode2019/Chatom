import AppBar from '@suid/material/AppBar';
import ArrowBackIcon from '@suid/icons-material/ArrowBack';
import IconButton from '@suid/material/IconButton';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';

import { useState } from './Home';

export default function Conversation(props) {
  const [state, setState] = useState();

  const conversation = () => state.conversations[props.conversation];
  const user = () => state.users[Object.values(conversation().members)[0].user_id];

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
            {user().username}
          </Typography>
        </Toolbar>
      </AppBar>

      <div class='messages'>
        <div class="mine message-container">
          <div class="message">
            Hello
          </div>
        </div>
        <div class="mine message-container">
          <div class="message last">
            How are you doing?
          </div>
        </div>
        <div class="yours message-container">
          <div class="message last">
            I'm doing well
          </div>
        </div>
      </div>

      <input
      className='message-input'
      type='text'
      placeholder='Write a message...'
      />
    </div>
    );
}
