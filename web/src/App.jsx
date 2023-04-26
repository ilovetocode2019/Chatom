import { createSignal } from 'solid-js';
import { Router, Route, Routes, Navigate } from '@solidjs/router';

import { ThemeProvider, createTheme } from '@suid/material/styles';
import CssBaseline from '@suid/material/CssBaseline';

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


function App() {
  const [loggedIn, setLoggedIn] = createSignal(localStorage.getItem('token') !== null);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path='/' element={loggedIn() ? <Home login={setLoggedIn} /> : <Navigate href='/login' />} />
          <Route path='/login' element={loggedIn() ? <Navigate href='/' /> : <Login login={setLoggedIn} />} />
          <Route path='/signup' element={loggedIn() ? <Navigate href='/' /> : <Signup login={setLoggedIn} />} />
          <Route path='*' element={<Navigate href='/' />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
