import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

class NewConversation extends React.Component {
  render() {
    return (
      <Dialog
      open={this.props.open}
      onClose={this.props.close}
      >
        <DialogTitle>Enable Notifiations?</DialogTitle>

        <DialogContent>
            <Typography>Would you like to be notified when you get a message? You can change this at any time in settings</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={this.props.yes}>Yes</Button>
          <Button onClick={this.props.no}>No</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default NewConversation;
