import React from 'react';
import { Link, Redirect } from 'react-router-dom';
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
    } else if (this.state.emailMissing === true || this.state.passwordMissing === true){
      this.setState({emailMissing: false, passwordMissing: false});
    }

    api.post('/account/token', {email: email, password: password})
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
            <h1>Log In</h1>
              {this.state.error ? <p className='form-error'>{this.state.error}</p>: null}
              {this.state.emailMissing ? <label htmlFor='email'><b className='form-error'>Email - This required field is missing</b></label>: <label htmlFor='email'><b>Email</b></label>}<br />
              <input type='email' className='form-input' id='email' placeholder='Enter Email' name='email' autoComplete='off' onChange={this.handleChange}/><br /><br />
              {this.state.passwordMissing ? <label htmlFor='password'><b className='form-error'>Password - This required field is missing</b></label>: <label htmlFor='password'><b>Password</b></label>}<br />
              <input type='password' className='form-input' id='password' placeholder='Enter Password' name='password' autoComplete='off' onChange={this.handleChange}/><br /><br />
            <input type='submit' className='form-submit' value='Log In' disabled={this.state.isLoading} />
            <footer>Don't have an account? <Link className='link' to='/signup'>Sign up</Link></footer>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
