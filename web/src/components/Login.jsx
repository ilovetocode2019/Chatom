import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';

import Button from '@suid/material/Button';;
import Grid from '@suid/material/Grid';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';

import api from '../lib/api';

export default function Login(props) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal();

  const onSubmit = (event) => {
    event.preventDefault();

    if (!(email() && password())) {
      setError('Email and password are required to login.');
      return;
    }

    api.post('/account/token', {email: email(), password: password()})
    .then(response => {
      localStorage.setItem('token', response.data.token);
      props.login(true);
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
            <Typography variant='h4'>Log In</Typography>
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
            label='Password'
            placeholder='Enter Password'
            variant='outlined'
            type='password'
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button type='submit' variant='contained'>Log In</Button>
          </Grid>
          <Grid item>
            <footer>Don't have an account? <A style={{color: '#90caf9'}} href='/signup'>Sign up</A></footer>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
