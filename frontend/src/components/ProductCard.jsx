import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { currency, getImageUrl } from '../utils/format.js';
import { useToastStore } from '../store/toastStore.js';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  console.log('ProductCard product:', product);

  const image = getImageUrl(product?.imageUrl || product?.gallery?.[0]);
  console.log(`Product: ${product.name}, ImageURL: ${image}`);
  const badges = product?.certificationTags?.slice(0, 2) || [];

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation to detail page
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(product);
    addToast(`Added ${product.name} to cart`);
  };

  return (
    <Link to={`/product/${product._id}`} className="card" aria-label={`View ${product.name}`}>
      <div className="card-media" style={{ aspectRatio: '16/10' }}>
        <img src={image} alt={product?.name} loading="lazy" />
        <div className="price-badge" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>{currency(product?.price)}</div>
      </div>

      <div className="card-body" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className="card-title" style={{ fontSize: '1rem', lineHeight: 1.3 }}>{product?.name}</h3>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          by <span style={{ color: 'var(--brand)', fontWeight: 500 }}>{product?.farmer?.name || 'Verified Farmer'}</span>
        </div>

        <p className="card-desc" style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '0.75rem',
          lineHeight: 1.4
        }}>
          {product?.description}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {badges.map(b => (
              <span key={b} style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#065f46', padding: '0.1rem 0.4rem', borderRadius: 999 }}>
                {b}
              </span>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            className="btn-primary"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
