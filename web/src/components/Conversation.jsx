import AppBar from '@suid/material/AppBar';
import ArrowBackIcon from '@suid/icons-material/ArrowBack';
import IconButton from '@suid/material/IconButton';
import Typography from '@suid/material/Typography';

import { useState } from './Home';

export default function Conversation(props) {
  const [state, setState] = useState();

  const conversation = () => state.conversations[props.conversation];
  const user = () => state.users[Object.values(conversation().members)[0].user_id];

  return (
    <div ref={props.ref} class='conversation'>
      <AppBar sx={{boxShadow: 'none'}} position='sticky'>
        <Typography align='center' variant='h6'>
          <Show when={props.exit}>
            <IconButton sx={{float: 'left', verticalAlign: 'center', padding: '5px'}}>
              <ArrowBackIcon sx={{width: 28, height: 28}} onClick={props.exit} />
            </IconButton>
          </Show>

          {user().username}
        </Typography>
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
