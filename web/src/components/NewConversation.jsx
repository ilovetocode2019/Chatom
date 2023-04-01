import Button from '@suid/material/Button';
import Dialog from '@suid/material/Dialog';
import DialogActions from '@suid/material/DialogActions';
import DialogContent from '@suid/material/DialogContent';
import DialogTitle from '@suid/material/DialogTitle';
import TextField from '@suid/material/TextField';

export default function NewConversation(props) {
  return (
    <Dialog open={true} onClose={props.close}>
      <DialogTitle>New Conversation</DialogTitle>

      <DialogContent>
        <form onSubmit={props.close}>
          <TextField
          autoFocus
          margin='dense'
          label='Recipient'
          type='text'
          fullWidth
          variant='standard'
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.close}>Cancel</Button>
        <Button onClick={props.close}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}
