import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import api from '../lib/api';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      emailMissing: false,
      passwordMissing: false,
      error: null,
      isLoading: false,
      redirect: localStorage.getItem('token')
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({isLoading: true});

    const email = this.state.email;
    const password = this.state.password;

    if (email === '' || password === '') {
      this.setState({emailMissing: email === '', passwordMissing: password === '', error: null, isLoading: false});
      return;
    }

    api.post('/account/token', {email: email, password: password})
    .then(response => {
      localStorage.setItem('token', response.data.token);
      this.props.login();
      this.setState({redirect: true});
    })
    .catch(error => {
      if (error.response) {
        this.setState({
          emailMissing: false,
          passwordMissing: false,
          error: error.response.data,
          isLoading: false
        });
      } else {
        this.setState({
          emailMissing: false,
          passwordMissing: false,
          error: 'Couldn\'t contact the server. Try again later?',
          isLoading: false
        });
      }
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to='/' />;
    }
  
    return (
      <div className='form-background'>
        <div className='form-modal'>
          <form onSubmit={this.handleSubmit}>
            <Grid
            container
            direction='column'
            spacing={2}
            >
              <Grid item>
                <Typography component='h1' variant='h5'>Log In</Typography>
                {this.state.error ? <FormHelperText error>{this.state.error}</FormHelperText> : null}
              </Grid>

              <Grid item>
                <TextField
                autoFocus
                error={this.state.emailMissing}
                fullWidth
                helperText={this.state.emailMissing ? 'This required field is missing' : null}
                label='Email'
                margin='dense'
                name='email'
                onChange={this.handleChange}
                placeholder='Enter Email'
                type='email'
                variant='outlined'
                />
              </Grid>

              <Grid item>
                <TextField
                autoFocus
                error={this.state.passwordMissing}
                fullWidth
                helperText={this.state.passwordMissing ? 'This required field is missing' : null}
                label='Password'
                margin='dense'
                name='password'
                onChange={this.handleChange}
                placeholder='Enter Password'
                type='password'
                variant='outlined'
                />
              </Grid>

              <Grid item>
                <Button disabled={this.state.isLoading} onClick={this.handleSubmit} variant='contained'>Log In</Button>
              </Grid>

              <Grid item>
                <footer>Don't have an account? <Link to='/signup'>Sign up</Link></footer>
              </Grid>
            </Grid>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
