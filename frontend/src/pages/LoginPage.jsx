import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Welcome back to GreenHarvest</h2>
      <p className="auth-subtitle">
        Sign in to manage your orders, track deliveries, or update your farm inventory.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <p style={{ color: 'red', marginTop: '-0.4rem', marginBottom: '0.75rem' }}>{error}</p>}
        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Login
        </button>
      </form>
      <p className="auth-helper">
        New to GreenHarvest? You can create a customer or farmer account from the Register page.
      </p>
    </div>
  );
};

export default LoginPage;

