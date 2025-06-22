import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../App';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  const authLinks = (
    <ul>
      <li>
        <Link to="/">Dashboard</Link>
      </li>
      <li>
        <Link to="/demo">Chessboard Demo</Link>
      </li>
      <li>
        <a onClick={logout} href="#!">
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/demo">Chessboard Demo</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar bg-primary">
      <h1>
        <Link to="/">
          <i className="fas fa-chess"></i> Chess Coach
        </Link>
      </h1>
      <div>{isAuthenticated ? authLinks : guestLinks}</div>
    </nav>
  );
};

export default Navbar;
