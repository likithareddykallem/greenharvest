import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const sectionsByVariant = {
  public: [
    {
      title: 'About',
      links: ['Our mission', 'How it works', 'Certifications'],
    },
    {
      title: 'Quick links',
      items: [
        { label: 'Catalog', to: '/catalog' },
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ],
    },
  ],
  customer: [
    {
      title: 'Support',
      links: ['Help center', 'Returns policy', 'Delivery tracking'],
    },
    {
      title: 'Stay in touch',
      links: ['Support@greenharvest.io', '+1 (555) 010-900'],
    },
  ],
  farmer: [
    {
      title: 'Farmer docs',
      links: ['Product upload guide', 'Payouts & settlements', 'Grafana dashboards'],
    },
    {
      title: 'Contact',
      links: ['farmer-success@greenharvest.io', '+1 (555) 010-120'],
    },
  ],
  admin: [
    {
      title: 'Internal tools',
      links: ['User admin', 'System health', 'Runbooks'],
    },
  ],
};

const Footer = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const variant = useMemo(() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/farmer')) return 'farmer';
    if (user?.role === 'customer' || location.pathname.startsWith('/orders')) return 'customer';
    return 'public';
  }, [location.pathname, user]);

  const version = import.meta.env.VITE_APP_VERSION || 'dev';

  return (
    <footer className={`app-footer app-footer--${variant}`}>
      <div className="app-footer__grid">
        {sectionsByVariant[variant].map((section) => (
          <div key={section.title}>
            <h4>{section.title}</h4>
            <ul>
              {(section.items || section.links).map((link) =>
                typeof link === 'string' ? (
                  <li key={link}>{link}</li>
                ) : (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
        <div>
          <h4>Newsletter</h4>
          <p>Seasonal harvest drops and transparency reports.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
            className="footer-newsletter"
          >
            <input type="email" placeholder="you@email.com" aria-label="Email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="app-footer__meta">
        <span>© {new Date().getFullYear()} GreenHarvest</span>
        <span>Version {version}</span>
      </div>
    </footer>
  );
};

export default Footer;





