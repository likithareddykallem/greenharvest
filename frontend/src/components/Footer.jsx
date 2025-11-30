// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer" style={{
    background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
    color: 'white',
    padding: '4rem 0 2rem',
    marginTop: 'auto'
  }}>
    <div className="max-site">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
            }}>GH</div>
            GreenHarvest
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Empowering local farmers and bringing fresh, organic produce directly to your table.
            Transparent, sustainable, and delicious.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>Platform</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/catalog" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Marketplace</Link></li>
            <li><Link to="/home" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Our Story</Link></li>
            <li><Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Become a Farmer</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ color: '#94a3b8' }}>Help Center</li>
            <li style={{ color: '#94a3b8' }}>Delivery Areas</li>
            <li style={{ color: '#94a3b8' }}>Return Policy</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>Stay Fresh</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Subscribe for seasonal updates and exclusive offers.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Email address"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.6rem 1rem',
                fontSize: '0.9rem',
                borderRadius: '6px',
                width: '100%'
              }}
            />
            <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', background: '#10b981', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
              Join
            </button>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#64748b',
        fontSize: '0.875rem'
      }}>
        <span>&copy; {new Date().getFullYear()} GreenHarvest Inc.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookies</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
