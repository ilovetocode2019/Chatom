import { createSignal } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';

import { Button, Grid, TextField, Typography, FormHelperText } from '@suid/material';

import api from '../lib/api';

export default function Signup(props) {
  const [email, setEmail] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');

  const navigate = useNavigate();

  const onSubmit = (event) => {
    event.preventDefault();

    if (!(email() && email() && password())) {
      setError('Email, username, and password are required to signup.');
      return;
    }

    api.post('/account', {email: email(), username: username(), password: password()})
    .then(response => {
      localStorage.setItem('token', response.data.token);
      props.login(true);
      navigate('/');
    })
    .catch(error => {
      if (error.response) {
        setError(error.response.data || 'Unexpected error.');
      } else {
        setError('Unable to contact server. Try again later?');
      }
    });
  }

  return (
    <div class='form-background'>
      <form class='form-modal' onSubmit={onSubmit}>
        <Grid
        container
        direction='column'
        spacing={3}
        >
          <Grid item>
            <Typography variant='h4'>Sign Up</Typography>
          </Grid>

          <Show when={error()}>
            <Grid item>
              <Typography color='red'>{error()}</Typography>
            </Grid>
          </Show>

          <Grid item>
            <TextField
            label='Email'
            placeholder='Enter Email'
            variant='outlined'
            fullWidth
            onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>

          <Grid item>
            <TextField
            label='Username'
            placeholder='Enter Username'
            variant='outlined'
            fullWidth
            onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>

          <Grid item>
            <TextField
            label='Password'
            placeholder='Enter Password'
            variant='outlined'
            type='password'
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button type='submit' variant='contained'>Sign Up</Button>
          </Grid>
          <Grid item>
            <footer>Already have an account? <A style={{color: '#90caf9'}} href='/login'>Log in</A></footer>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
