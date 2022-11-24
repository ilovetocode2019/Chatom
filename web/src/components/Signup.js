import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import api from '../lib/api';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      username: '',
      password: '',
      emailError: false,
      usernameError: false,
      passwordError: false,
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

    const emailIsEmpty = email === '';
    const usernameIsEmpty = username === '';
    const passwordIsEmpty = password === '';
  
    const message = 'This required field is missing';
    this.setState({
      emailError: emailIsEmpty? message : null,
      usernameError: usernameIsEmpty? message: null,
      passwordError: passwordIsEmpty? message: null,
      error: null,
      isLoading: false
    });

    if (emailIsEmpty || usernameIsEmpty || passwordIsEmpty) {
      return;
    }

    const errors = {}
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
      this.setState({emailError: null, usernameError: null, passwordError: null});
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
            <h1>Sign Up</h1>
              {this.state.error ? <p className='form-error'>{this.state.error}</p>: null}
              {this.state.emailError ? <label htmlFor='email'><b className='form-error'>Email - {this.state.emailError}</b></label>: <label htmlFor='email'><b>Email</b></label>}<br />
              <input type='text' className='form-input' id='email' placeholder='Enter Email' name='email' autoComplete='off' onChange={this.handleChange}/><br /><br />
              {this.state.usernameError ? <label htmlFor='username'><b className='form-error'>Username - {this.state.usernameError}</b></label>: <label htmlFor='username'><b>Username</b></label>}<br />
              <input type='text' className='form-input' id='username' placeholder='Enter Username' name='username' autoComplete='off' onChange={this.handleChange}/><br /><br />
              {this.state.passwordError ? <label htmlFor='password'><b className='form-error'>Password - {this.state.passwordError}</b></label>: <label htmlFor='password'><b>Password</b></label>}<br />
              <input type='password' className='form-input' id='password' placeholder='Enter Password' name='password' autoComplete='off' onChange={this.handleChange}/><br /><br />
            <input type='submit' className='form-submit' value='Sign Up' disabled={this.state.isLoading} />
            <footer>Already have an account? <Link className='link' to='/login'>Log in</Link></footer>
          </form>
        </div>
      </div>
    );
  }
}

export default Signup;
