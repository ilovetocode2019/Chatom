import React from 'react';

import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      changeEmail: false,
      changeUsername: false,
      changePassword: false,
      confirmLogout: false
    }
  }

  notificationChange = (event) => {
    if (event.target.checked) {
      this.props.enableNotifications();
    } else {
      this.props.disableNotifications();
    }
  }

  render() {
    return (
      <div>
        <Dialog
        open={this.props.open}
        onClose={this.props.close}
        >
          <DialogTitle variant='h5' textAlign='center'>
            Settings
          </DialogTitle>

          <DialogContent>
            <Box sx={{m: 2}} />

            <Grid
            container
            direction='column'
            >
              <Grid item>
                <Typography variant='h6'>Account</Typography>
              </Grid>

              <Grid item>
                <Typography display='inline'><b>Email</b><br />{this.props.me.email}</Typography>
              </Grid>

              <Grid item>
                <Button onClick={() => this.setState({changeEmail: true})} fullWidth variant='contained'>Change</Button>
              </Grid>

              <Box sx={{m: 1}} />

              <Grid item>
                <Typography display='inline'><b>Username</b><br />{this.props.me.username}</Typography>
              </Grid>

              <Grid item>
                <Button onClick={() => this.setState({changeUsername: true})} fullWidth variant='contained'>Change</Button>
              </Grid>

              <Box sx={{m: 2}} />

              <Grid item>
                <Typography variant='h6'>Device</Typography>
              </Grid>

              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <Typography display='inline'>Notifications</Typography>
                    <Switch onChange={this.notificationChange} checked={localStorage.getItem('notificationPreference') === 'enabled'} />
                  </Grid>
                </Grid>
              </Grid>

              <Box sx={{m: 1}} />

              <Grid item>
                <Typography variant='h6'>Security</Typography>
              </Grid>

              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <Button onClick={() => this.setState({changePassword: true})} variant='contained' color='warning'>Change Password</Button>
                  </Grid>
  
                  <Grid item>
                    <Button onClick={() => this.setState({confirmLogout: true})} variant='contained' color='error'>Log Out</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.props.close}>Done</Button>
          </DialogActions>
        </Dialog>

        <ChangeEmail
        open={this.state.changeEmail}
        close={() => this.setState({changeEmail: false})}
        api={this.props.api}
        />

        <ChangeUsername
        open={this.state.changeUsername}
        close={() => this.setState({changeUsername: false})}
        api={this.props.api}
        />

        <ChangePassword
        open={this.state.changePassword}
        close={() => this.setState({changePassword: false})}
        api={this.props.api}
        />

        <ConfirmLogout
        open={this.state.confirmLogout}
        close={() => this.setState({confirmLogout: false})}
        logout={this.props.logout}
        />
      </div>
    );
  }
}

class ChangeEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPassword: '',
      newEmail: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.currentPassword) {
      this.setState({error: 'Current password is required.'});
      return;
    }

    if (!this.state.newEmail) {
      this.setState({error: 'New email is required.'});
      return
    }

    if (this.state.newEmail.length > 256) {
      this.setState({error: 'Email must be shorter than 256 characters'});
      return;
    }

    this.props.api.patch('/account', {
      email: this.state.newEmail,
      current_password: this.state.currentPassword
    })
    .then(response => {
      this.props.close();
    })
    .catch(error => {
      if (error.response) {
        this.setState({error: error.response.data});
        return;
      } else if (!error.response) {
        this.setState({error: 'Couldn\'t contact the server. Try again later?'});
      }
    })
  }

  render() {
    return(
      <Dialog
      open={this.props.open}
      onClose={this.props.close}
      >
        <DialogTitle variant='h6' textAlign='center'>
          Change Email
        </DialogTitle>

        <DialogContent>
          {this.state.error ? <FormHelperText error>{this.state.error}</FormHelperText> : null}

          <TextField
          fullWidth
          label='Current Password'
          margin='dense'
          name='currentPassword'
          onChange={this.handleChange}
          type='password'
          variant='outlined'
          />

          <TextField
          fullWidth
          label='New Email'
          margin='dense'
          name='newEmail'
          onChange={this.handleChange}
          type='email'
          variant='outlined'
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={this.props.close}>Cancel</Button>
          <Button onClick={this.handleSubmit}>Change</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

class ChangeUsername extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPassword: '',
      newUsername: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.currentPassword) {
      this.setState({error: 'Current password is required.'});
      return;
    }

    if (!this.state.newUsername) {
      this.setState({error: 'New username is required.'});
      return
    }

    if (this.state.newUsername.length < 2) {
      this.setState({error: 'Username must be at least 2 characters.'});
      return;
    }

    if (this.state.newUsername.length > 256) {
      this.setState({error: 'Username must be shorter than 256 characters.'});
      return;
    }

    this.props.api.patch('/account', {
      username: this.state.newUsername,
      current_password: this.state.currentPassword
    })
    .then(response => {
      this.props.close();
    })
    .catch(error => {
      if (error.response) {
        this.setState({error: error.response.data});
        return;
      } else if (!error.response) {
        this.setState({error: 'Couldn\'t contact the server. Try again later?'});
      }
    })
  }

  render() {
    return(
      <Dialog
      open={this.props.open}
      onClose={this.props.close}
      >
        <DialogTitle variant='h6' textAlign='center'>
          Change Email
        </DialogTitle>

        <DialogContent>
          {this.state.error ? <FormHelperText error>{this.state.error}</FormHelperText> : null}

          <TextField
          fullWidth
          label='Current Password'
          margin='dense'
          name='currentPassword'
          onChange={this.handleChange}
          type='password'
          variant='outlined'
          />

          <TextField
          fullWidth
          label='New Username'
          margin='dense'
          name='newUsername'
          onChange={this.handleChange}
          type='username'
          variant='outlined'
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={this.props.close}>Cancel</Button>
          <Button onClick={this.handleSubmit}>Change</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPassword: '',
      newPassword: '',
      error: null
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.currentPassword) {
      this.setState({error: 'Current password is required.'});
      return;
    }

    if (!this.state.newPassword) {
      this.setState({error: 'New password is required.'});
      return
    }

    if (this.state.newPassword.length < 8) {
      this.setState({error: 'New password must be at least 8 characters.'});
      return;
    }

    this.props.api.patch('/account', {
      password: this.state.newPassword,
      current_password: this.state.currentPassword
    })
    .then(response => {
      this.props.close();
    })
    .catch(error => {
      if (error.response) {
        this.setState({error: error.response.data});
        return;
      } else if (!error.response) {
        this.setState({error: 'Couldn\'t contact the server. Try again later?'});
      }
    })
  }

  render() {
    return(
      <Dialog
      open={this.props.open}
      onClose={this.props.close}
      >
        <DialogTitle variant='h6' textAlign='center'>
          Change Password
        </DialogTitle>


        <DialogContent>
          {this.state.error ? <FormHelperText error>{this.state.error}</FormHelperText> : null}

          <TextField
          fullWidth
          label='Current Password'
          margin='dense'
          name='currentPassword'
          onChange={this.handleChange}
          type='password'
          variant='outlined'
          />

          <TextField
          fullWidth
          label='New Password'
          margin='dense'
          name='newPassword'
          onChange={this.handleChange}
          type='password'
          variant='outlined'
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={this.props.close}>Cancel</Button>
          <Button onClick={this.handleSubmit} color='warning'>Change</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

class ConfirmLogout extends React.Component {
  render() {
    return (
      <Dialog
      open={this.props.open}
      onClose={this.props.close}
      >
        <DialogTitle variant='h6' textAlign='center'>
          Log Out
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to log out?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={this.props.close}>Cancel</Button>
          <Button onClick={this.props.logout} color='error'>Log Out</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default Settings;
