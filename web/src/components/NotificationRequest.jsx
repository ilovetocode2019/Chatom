import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@suid/material';

export default function Notifications(props) {
  return (
    <Dialog
    open={true}
    onClose={props.close}
    >
      <DialogTitle>Enable Notifiations?</DialogTitle>

      <DialogContent>
          <Typography>Would you like to be notified when you receive messages? You can change this at any time in settings</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.yes}>Yes</Button>
        <Button onClick={props.no}>No</Button>
      </DialogActions>
    </Dialog>
  );
}
