import { createSignal, Show } from 'solid-js';

import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Dialog from '@suid/material/Dialog';
import DialogActions from '@suid/material/DialogActions';
import DialogContent from '@suid/material/DialogContent';
import DialogTitle from '@suid/material/DialogTitle';
import Grid from '@suid/material/Grid';
import Switch from '@suid/material/Switch';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';

import { useState } from './Home';

export default function Settings(props) {
  const [state, api] = useState();

  const [changeEmail, setChangeEmail] = createSignal(false);
  const [changeUsername, setChangeUsername] = createSignal(false);
  const [changePassword, setChangePassword] = createSignal(false);
  const [confirmLogout, setConfirmLogout] = createSignal(false);

  return (
    <>
      <Dialog open={true} onClose={props.close}>
        <DialogTitle variant='h5' textAlign='center'>
          Settings
        </DialogTitle>

        <DialogContent>
          <Grid
          container
          direction='column'
          >
            <Box sx={{m: 1}} />

            <Grid item>
              <Typography variant='h6'>Account</Typography>
            </Grid>

            <Grid item>
              <Typography display='inline'><b>Email</b><br />{state.email}</Typography>
            </Grid>

            <Grid item>
              <Button onClick={() => setChangeEmail(true)} fullWidth variant='contained'>Change</Button>
            </Grid>

            <Box sx={{m: 1}} />

            <Grid item>
              <Typography display='inline'><b>Username</b><br />{state.username}</Typography>
            </Grid>

            <Grid item>
              <Button onClick={() => setChangeUsername(true)} fullWidth variant='contained'>Change</Button>
            </Grid>

            <Box sx={{m: 2}} />

            <Grid item>
              <Typography variant='h6'>Device</Typography>
            </Grid>

            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <Typography sx={{display: 'inline'}} display='inline'>Notifications</Typography>
                  <Switch checked={true} />
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
                  <Button onClick={() => setChangePassword(true)} variant='contained' color='warning'>Change Password</Button>
                </Grid>

                <Grid item>
                  <Button onClick={() => setConfirmLogout(true)} variant='contained' color='error'>Log Out</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={props.close}>Done</Button>
        </DialogActions>
      </Dialog>

      <Show when={changeEmail()}>
        <ChangeEmail close={() => setChangeEmail(false)} />
      </Show>

      <Show when={changeUsername()}>
        <ChangeUsername close={() => setChangeUsername(false)} />
      </Show>

      <Show when={changePassword()}>
        <ChangePassword close={() => setChangePassword(false)} />
      </Show>

      <Show when={confirmLogout()}>
        <ConfirmLogout logout={props.logout} close={() => setConfirmLogout(false)} />
      </Show>
    </>
  );
}

function ChangeEmail(props) {
  return (
    <Dialog open={true} onClose={props.close}>
      <DialogTitle variant='h6' textAlign='center'>
        Change Email
      </DialogTitle>

      <DialogContent>
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
        <Button onClick={props.close}>Cancel</Button>
        <Button onClick={props.close}>Change</Button>
      </DialogActions>
    </Dialog>
  );
}

function ChangeUsername(props) {
  return (
    <Dialog open={true} onClose={props.close}>
      <DialogTitle variant='h6' textAlign='center'>
        Change Username
      </DialogTitle>

      <DialogContent>
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
        <Button onClick={props.close}>Cancel</Button>
        <Button onClick={props.close}>Change</Button>
      </DialogActions>
    </Dialog>
  );
}

function ChangePassword(props) {
  return (
    <Dialog open={true} onClose={props.close}>
      <DialogTitle variant='h6' textAlign='center'>
        Change Password
      </DialogTitle>

      <DialogContent>
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
        <Button onClick={props.close}>Cancel</Button>
        <Button onClick={props.close} color='warning'>Change</Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmLogout(props) {
  return (
    <Dialog open={true} onClose={props.close}>
      <DialogTitle variant='h6' textAlign='center'>
        Confirm Logout
      </DialogTitle>

      <DialogContent>
        Are you sure you really want to log out?
      </DialogContent>

      <DialogActions>
        <Button onClick={props.close}>Cancel</Button>
        <Button onClick={props.logout} color='error'>Log Out</Button>
      </DialogActions>
    </Dialog>
  );
}
