import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useCartStore } from '../store/cartStore.js';

const fallbackImage =
  'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=900&q=80';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    client.get(`/api/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <div className="container">Loading…</div>;

  const gallery = [product.imageUrl, ...(product.gallery || [])].filter(Boolean);

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <p className="eyebrow">{product.categories?.join(' · ') || 'Featured harvest'}</p>
          <h2 className="container-title">{product.name}</h2>
          <p className="container-subtitle">{product.description}</p>
        </div>
      </div>

      <div className="product-detail">
        <div className="product-detail__media">
          <img src={gallery[0] || fallbackImage} alt={product.name} loading="lazy" />
          <div className="product-detail__thumbnails">
            {gallery.slice(1).map((src) => (
              <img key={src} src={src} alt={`${product.name} alternate`} loading="lazy" />
            ))}
          </div>
        </div>

        <div className="product-detail__info">
          <div className="product-detail__meta">
            <div>
              <span>Price</span>
              <strong>${product.price}</strong>
            </div>
            <div>
              <span>Available</span>
              <strong>{product.stock}</strong>
            </div>
          </div>

          <p>
            Grown by <strong>{product.farmer?.name || 'a verified farmer'}</strong>. Certifications:{' '}
            {product.certificationTags?.join(', ') || 'Pending admin review'}.
          </p>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value) || 1)}
            />
          </label>

          <div className="product-detail__actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                addItem(product, quantity);
                navigate('/cart');
              }}
            >
              Add to cart
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/catalog')}>
              Back to catalog
            </button>
          </div>

          <div className="product-detail__badges">
            {product.certificationTags?.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
            {product.metadata?.method && <span>{product.metadata.method}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

