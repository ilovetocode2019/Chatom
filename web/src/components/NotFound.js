import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <center>
        <h1>This page doesn't exist</h1><br />

        <Link className="link" to="/">
          Go to homepage
        </Link>
    </center>
  );
}

export default NotFound;
