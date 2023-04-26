import { createSignal } from 'solid-js';

import Button from '@suid/material/Button';
import Dialog from '@suid/material/Dialog';
import DialogActions from '@suid/material/DialogActions';
import DialogContent from '@suid/material/DialogContent';
import DialogTitle from '@suid/material/DialogTitle';
import TextField from '@suid/material/TextField';

import { useState } from './Home'

export default function NewConversation(props) {
  const [state, api] = useState();

  const [recipient, setRecipient] = createSignal('');
  const [error, setError] = createSignal();

  const onSubmit = (event) => {
    event.preventDefault();

    api.post('/users/username', {username: recipient()})
    .then(response => {
      createConversation(response.data);
    })
    .catch(error => {
      if (error.response) {
        setError(error.response.data);
      } else {
        setError('Unable to contact server. Try again later?');
      }
    })
  }


  const createConversation = (user) => {
    api.get(`/users/${user.id}/conversation`)
    .then(response => {
      props.submit(response.data, user);
      props.close();
    })
  }

  return (
    
    <Dialog open={true} onClose={props.close}>
      <DialogTitle>New Conversation</DialogTitle>

      <DialogContent>
        <form onSubmit={onSubmit}>
          <TextField
          autoFocus
          margin='dense'
          label='Recipient'
          type='text'
          fullWidth
          variant='standard'
          error={error()}
          helperText={error()}
          onChange={(e) => setRecipient(e.target.value)}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.close}>Cancel</Button>
        <Button onClick={onSubmit}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}
