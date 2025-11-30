// src/components/Header.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

import Logo from './Logo';

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="app-header">
      <div className="max-site header-content">
        <div className="header-left">
          <Link to="/home" className="logo-link">
            <Logo />
          </Link>
        </div>

        <nav className="header-nav">
          {/* Customer / Guest Links */}
          {(!user || user.role === 'customer') && (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Home
              </NavLink>
              <NavLink
                to="/catalog"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Marketplace
              </NavLink>
            </>
          )}

          {/* Customer Only Links */}
          {user?.role === 'customer' && (
            <>
              <NavLink
                to="/cart"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Cart
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Orders
              </NavLink>
            </>
          )}

          {/* Farmer Links */}
          {user?.role === 'farmer' && (
            <>
              <NavLink
                to="/farmer"
                end
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/farmer/orders"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Orders
              </NavLink>
            </>
          )}

          {/* Admin Links */}
          {user?.role === 'admin' && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Dashboard
              </NavLink>
            </>
          )}

          <div className="nav-divider" />

          {!user && (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="btn-primary btn-sm">Join Now</Link>
            </>
          )}
          {user && (
            <div className="user-menu">
              <span className="user-name">
                {user.name?.split(' ')[0]} <span style={{ opacity: 0.7, fontSize: '0.85em' }}>({user.role})</span>
              </span>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
