import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home'
import NotFound from './components/NotFound';
import './index.css';

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loggedIn: localStorage.getItem('token') !== null};
  }

  login = () => {
    this.setState({loggedIn: true});
  }

  logout = () => {
    this.setState({logedIn: false});
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/signup">
              <Signup login={this.login}/>
            </Route>
            <Route path="/login">
              <Login login={this.login}/>
            </Route>
            <Route path="/">
              {this.state.loggedIn ? <Home logout={this.logout} /> : <Redirect to="/login" />}
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </BrowserRouter>
      </ThemeProvider>
    )
  }
}

export default App;
