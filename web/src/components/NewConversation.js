import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

class NewConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      error: null,
      helper: null,
      disabled: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (event) => {
    this.setState({error: false, helper: null, value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.value) {
      return;
    }

    this.setState({disabled: true});

    this.props.api.post('/users/username', {username: this.state.value})
    .then(response => {
      this.createConversation(response.data);
    })
    .catch(error => {
      if (error.response) {
        this.setState({error: true, helper: error.response.data, disabled: false});
        return;
      } else if (!error.response) {
        this.setState({error: true, helper: 'Couldn\'t contact the server. Try again later?', disabled: false});
        return;
      }
    });
  }

  createConversation = (user) => {
    this.props.api.get(`/users/${user.id}/conversation`)
    .then(response => {
      this.props.submit(user, response.data);
      this.props.close();
    }).catch(error => {
      if (error.response) {
        this.setState({error: true, helper: error.response.data, disabled: false});
        return;
      } else if (!error.response) {
        this.setState({error: true, helper: 'Couldn\'t contact the server. Try again later?', disabled: false});
        return;
      }
    });
  }

  render() {
    return (
      <Dialog
      open={this.props.open}
      onClose={this.props.close}
      >
        <DialogTitle>New Conversation</DialogTitle>

        <DialogContent>
          <form onSubmit={this.handleSubmit}>
            <TextField
            autoFocus
            margin='dense'
            label='Recipient'
            type='text'
            fullWidth
            variant='standard'
            error={this.state.error}
            helperText={this.state.helper}
            onChange={this.handleChange}
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button disabled={this.state.disabled} onClick={this.props.close}>Cancel</Button>
          <Button disabled={this.state.disabled} onClick={this.handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default NewConversation;
