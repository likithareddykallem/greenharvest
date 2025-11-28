import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create your GreenHarvest account</h2>
      <p className="auth-subtitle">
        Choose whether you&apos;re signing up as a customer or a farmer. You can always request
        additional permissions later.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full name or organisation"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Work email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="customer">I want to order produce (customer)</option>
          <option value="farmer">I want to sell my harvest (farmer)</option>
        </select>
        {error && (
          <p style={{ color: 'red', marginTop: '-0.4rem', marginBottom: '0.75rem' }}>{error}</p>
        )}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Sign up
        </button>
      </form>
      <p className="auth-helper">
        Already have an account? You can sign in on the Login page using your email and password.
      </p>
    </div>
  );
};

export default RegisterPage;

