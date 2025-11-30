// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const RoleButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`role-btn ${active ? 'active' : ''}`}
    aria-pressed={active}
  >
    {children}
  </button>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');

  const setRole = (role) => setForm((f) => ({ ...f, role }));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = await login({ email: form.email, password: form.password });
      if (user.role === 'farmer') navigate('/farmer');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-hero">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Sign in to your GreenHarvest account
        </p>

        <div className="role-selector">
          <RoleButton active={form.role === 'customer'} onClick={() => setRole('customer')}>Customer</RoleButton>
          <RoleButton active={form.role === 'farmer'} onClick={() => setRole('farmer')}>Farmer</RoleButton>
          <RoleButton active={form.role === 'admin'} onClick={() => setRole('admin')}>Admin</RoleButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              background: '#fef2f2',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            className="link-like"
            onClick={() => navigate('/register')}
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
