import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const roleCopy = {
  admin: 'Platform control',
  farmer: 'Farmer workspace',
  customer: 'Fresh produce access',
};

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const canSeeCatalog = !user || user.role === 'customer';

  const navLinks = [
    ...(canSeeCatalog ? [{ to: '/catalog', label: 'Catalog' }] : []),
    ...(user?.role === 'customer' ? [{ to: '/orders', label: 'My orders' }] : []),
    ...(user?.role === 'farmer'
      ? [
          { to: '/farmer', label: 'Farmer hub' },
          { to: '/farmer/orders', label: 'Order board' },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          { to: '/admin', label: 'Admin console' },
          { to: '/admin/analytics', label: 'Analytics' },
        ]
      : []),
  ];

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="app-header" aria-label="Primary">
      <div className="app-header__left">
        <Link to="/catalog" className="logo">
          <span className="logo-mark" aria-hidden="true">
            GH
          </span>
          <span className="logo-type">GreenHarvest</span>
        </Link>
        <div className="logo-tagline">Farmer-first marketplace</div>
      </div>

      {canSeeCatalog && (
        <form className="header-search" onSubmit={handleSearch} role="search">
          <span aria-hidden="true">🔍</span>
          <input
            name="q"
            type="search"
            placeholder="Search produce, farms, certifications"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search catalog"
          />
        </form>
      )}

      <nav className="app-header__nav" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        {(!user || user.role === 'customer') && (
          <Link to="/cart" className="pill-link">
            🛒 Cart
          </Link>
        )}
        {!user && (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn-pill">
              Join now
            </Link>
          </>
        )}
        {user && (
          <button type="button" className="btn-pill ghost" onClick={logout}>
            Logout
          </button>
        )}
      </nav>

      {user && (
        <div className="role-chip" aria-live="polite">
          <span>{user.role}</span>
          <small>{roleCopy[user.role]}</small>
        </div>
      )}
    </header>
  );
};

export default Header;


