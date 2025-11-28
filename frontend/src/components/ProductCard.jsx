import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const image =
    product.imageUrl ||
    product.gallery?.[0] ||
    'https://images.pexels.com/photos/6157044/pexels-photo-6157044.jpeg?auto=compress&cs=tinysrgb&w=800&q=80';
  const badges = product.certificationTags?.slice(0, 2) || [];

  return (
    <Link to={`/product/${product._id}`} className="product-card" aria-label={`View ${product.name}`}>
      <div className="product-card__media">
        <img src={image} alt={product.name} loading="lazy" />
        <span className="product-card__chip">${product.price}</span>
      </div>
      <div className="product-card__body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__meta">
          <span>{product.farmer?.name || 'Verified farmer'}</span>
          <span>Stock: {product.stock}</span>
        </div>
        <div className="product-card__badges">
          {badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <div className="product-card__cta">View details</div>
      </div>
    </Link>
  );
};

export default ProductCard;





