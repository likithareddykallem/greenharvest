import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page-content">
      <div className="max-site">
        {/* Hero Section */}
        <section className="hero-block">
          <div className="hero-block__body">
            <span className="hero-eyebrow">Fresh from the Earth</span>
            <h1 className="hero-title">
              Sustainable Farming,<br />
              Delivered to You.
            </h1>
            <p className="hero-sub">
              Experience the freshest organic produce, sourced directly from local eco-friendly farms.
              Trace every vegetable from seed to your table.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/catalog" className="btn-primary">
                Shop Fresh Produce
              </Link>
              <Link to="/register" className="btn-secondary">
                Join GreenHarvest
              </Link>
            </div>
          </div>
          <div className="hero-block__media">
            <img src="/images/hero-farm.jpg" alt="Sustainable Farm at Golden Hour" />
          </div>
        </section>

        {/* Features / Value Prop */}
        <section className="site-wrap feature-section">
          <div className="section-header">
            <h2 className="section-title">
              Why Choose GreenHarvest?
            </h2>
            <p className="section-sub">
              We bridge the gap between conscious consumers and sustainable farmers.
            </p>
          </div>

          <div className="grid-cards">
            {/* Feature 1 */}
            <div className="card feature-card">
              <div className="feature-icon">🌱</div>
              <h3 className="card-title">100% Organic</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Certified organic produce free from harmful pesticides and synthetic fertilizers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card feature-card">
              <div className="feature-icon">🚜</div>
              <h3 className="card-title">Farmer Direct</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Support local farmers directly. Fair prices for them, fresh food for you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card feature-card">
              <div className="feature-icon">🚚</div>
              <h3 className="card-title">Farm to Door</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Harvested in the morning, delivered to your doorstep by the afternoon.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Preview */}
        <section className="hero-block hero-block--reverse" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div className="hero-block__body">
            <span className="hero-eyebrow">Seasonal Favorites</span>
            <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>
              Taste the Difference
            </h2>
            <p className="hero-sub">
              Our seasonal boxes are curated to bring you the best flavors of the month.
              From crisp summer salads to hearty winter roots.
            </p>
            <Link to="/catalog" className="btn-primary">
              View Catalog
            </Link>
          </div>
          <div className="hero-block__media">
            <img src="/images/fresh-produce.png" alt="Fresh Organic Vegetables" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
