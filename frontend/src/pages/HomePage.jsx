import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client.js';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/api/products', { params: { limit: 4 } })
      .then((res) => setFeatured(res.data.items || []))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <section className="container">
        <div className="container-header">
          <div>
            <h1 className="container-title">A fresher way to move food from farm to table.</h1>
            <p className="container-subtitle">
              GreenHarvest connects restaurants, retailers and communities directly with local
              farmers. Traceable orders, fair pricing, and transparent certifications in one place.
            </p>
            <div className="container-badge-row">
              <span className="badge">
                <span className="badge-dot" />
                Trusted by small‑scale producers
              </span>
            </div>
          </div>
        </div>

        <div className="grid">
          {featured.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="product-card"
              style={{ textDecoration: 'none' }}
            >
              <div className="product-image-wrap">
                <img
                  src={
                    product.imageUrl ||
                    'https://images.pexels.com/photos/6157044/pexels-photo-6157044.jpeg?auto=compress&cs=tinysrgb&w=800&q=80'
                  }
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
                <div className="product-image-overlay" />
                <span className="product-chip">Featured</span>
              </div>
              <div className="product-card-body">
                <div className="product-title-row">
                  <div>
                    <h3 className="product-title">{product.name}</h3>
                    {product.farmer?.name && (
                      <p className="product-farmer">by {product.farmer.name}</p>
                    )}
                  </div>
                  <span className="product-price">${product.price}</span>
                </div>
                <p style={{ margin: '0.1rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container" style={{ marginTop: '1.5rem' }}>
        <div className="container-header">
          <div>
            <h2 className="container-title">How GreenHarvest works</h2>
            <p className="container-subtitle">
              One platform for customers, farmers and admins to keep every delivery organised and
              accountable.
            </p>
          </div>
        </div>
        <div className="grid">
          <article className="product-card">
            <div className="product-card-body">
              <h3 className="product-title">For customers</h3>
              <p className="product-farmer">
                Browse approved products, place secure orders, and track every step of the
                delivery.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                <li>Rich catalog with product images and certifications preview.</li>
                <li>Smart cart, fast checkout and live order timeline.</li>
              </ul>
            </div>
          </article>

          <article className="product-card">
            <div className="product-card-body">
              <h3 className="product-title">For farmers</h3>
              <p className="product-farmer">
                List harvests, upload certifications and manage approvals from one dashboard.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                <li>Add products with images, PDFs and metadata.</li>
                <li>Track stock, approvals and order demand.</li>
              </ul>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/login')}
              >
                Farmer sign‑in
              </button>
            </div>
          </article>

          <article className="product-card">
            <div className="product-card-body">
              <h3 className="product-title">For admins</h3>
              <p className="product-farmer">
                Review products, users and orders with auditable status history.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                <li>Approve or reject products with notes.</li>
                <li>Manage order states and user access.</li>
              </ul>
              <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
                Admin sign‑in
              </button>
            </div>
          </article>
        </div>
      </section>

      <footer
        style={{
          maxWidth: '1120px',
          margin: '2rem auto 3rem',
          padding: '1.25rem 0.5rem 0',
          fontSize: '0.8rem',
          color: '#6b7280',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <span>© {new Date().getFullYear()} GreenHarvest. All rights reserved.</span>
        <span>Built for traceable, low‑waste food supply chains.</span>
      </footer>
    </>
  );
};

export default HomePage;


