import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import api from '../lib/api';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      username: '',
      password: '',
      emailError: null,
      usernameError: null,
      passwordError: null,
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
    const username = this.state.username;
    const password = this.state.password;

    if (email === '' || username === '' || password === '') {
      const message = 'This required field is missing';
      this.setState({
        emailError: email === '' ? message : null,
        usernameError: username === '' ? message : null,
        passwordError: password === '' ? message : null,
        error: null,
        isLoading: false
      });  
      return;
    }

    const errors = {};

    if (email.length > 254) {
      errors.emailError = 'Must be shorter than 254 characters';
    }
    if (username.length < 2) {
      errors.usernameError = 'Must be at least 2 characters';
    }
    if (username.length > 50) {
      errors.usernameError = 'Must be shorter than 50 characters';
    }
    if (password.length < 8) {
      errors.passwordError = 'Must at least 8 characters';
    }
    if (password.length > 100) {
      errors.passwordError = 'Must be shorter than 100 characters';
    }

    if (Object.keys(errors).length === 0) {
      this.setState({
        emailError: null,
        usernameError: null,
        passwordError: null,
        error: null
      });
    } else {
      errors.error = null;
      errors.isLoading = false;
      this.setState(errors);
      return;
    }

    api.post('/account', {email: email, username: username, password: password})
    .then(response => {
      localStorage.setItem('token', response.data.token);
      this.props.login();
      this.setState({redirect: true});
    })
    .catch(error => {
      if (error.response) {
        this.setState({error: error.response.data, isLoading: false});
      } else {
        this.setState({error: 'Couldn\'t contact the server. Try again later?', isLoading: false});
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
                <Typography component='h1' variant='h5'>Sign Up</Typography>
                {this.state.error ? <FormHelperText error>{this.state.error}</FormHelperText> : null}
              </Grid>

              <Grid item>
                <TextField
                autoFocus
                error={this.state.emailError}
                fullWidth
                helperText={this.state.emailError}
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
                error={this.state.usernameError}
                fullWidth
                helperText={this.state.usernameError}
                label='Username'
                margin='dense'
                name='username'
                onChange={this.handleChange}
                placeholder='Enter Username'
                type='username'
                variant='outlined'
                />
              </Grid>

              <Grid item>
                <TextField
                autoFocus
                error={this.state.passwordError}
                fullWidth
                helperText={this.state.passwordError}
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
                <Button disabled={this.state.isLoading} onClick={this.handleSubmit} variant='contained'>Sign Up</Button>
              </Grid>

              <Grid item>
                <footer>Already have an account? <Link to='/login'>Log in</Link></footer>
              </Grid>
            </Grid>
          </form>
        </div>
      </div>
    );
  }
}

export default Signup;
