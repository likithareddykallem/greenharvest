import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import client from '../api/client.js';

const grafanaUrl =
  import.meta.env.VITE_GRAFANA_DASHBOARD_URL ||
  'http://localhost:3000/d/greenharvest/overview?orgId=1&kiosk';

const initialForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categories: [],
  certificationTags: [],
  metadata: { variety: '', method: '' },
};

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [certFiles, setCertFiles] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [taxonomy, setTaxonomy] = useState({ categories: [], certifications: [] });
  const [salesSeries, setSalesSeries] = useState([]);
  const [grafanaHealthy, setGrafanaHealthy] = useState(true);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const loadData = async () => {
    const [productsRes, ordersRes, profileRes, categoriesRes, certsRes, salesRes] = await Promise.all([
      client.get('/api/farmer/products'),
      client.get('/api/farmer/orders'),
      client.get('/api/farmer/profile'),
      client.get('/api/products/taxonomy', { params: { type: 'category' } }),
      client.get('/api/products/taxonomy', { params: { type: 'certification' } }),
      client.get('/api/farmer/sales/summary'),
    ]);
    setProducts(productsRes.data);
    setOrders(ordersRes.data);
    setProfile(profileRes.data);
    setTaxonomy({ categories: categoriesRes.data, certifications: certsRes.data });
    setSalesSeries(salesRes.data.series || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(
    () => () => {
      galleryPreview.forEach((url) => URL.revokeObjectURL(url));
    },
    [galleryPreview]
  );

  useEffect(() => {
    if (grafanaHealthy || !canvasRef.current || salesSeries.length === 0) return undefined;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: salesSeries.map((point) => point.date),
        datasets: [
          {
            label: 'Revenue ($)',
            data: salesSeries.map((point) => point.value),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.2)',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [grafanaHealthy, salesSeries]);

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    client.put('/api/farmer/profile', profile).then(() => loadData());
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (field, value) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }));
  };

  const handleMultiSelect = (event) => {
    const { name, selectedOptions } = event.target;
    const values = Array.from(selectedOptions).map((option) => option.value);
    handleFormChange(name, values);
  };

  const handleGalleryChange = (files) => {
    galleryPreview.forEach((url) => URL.revokeObjectURL(url));
    setGalleryFiles(files);
    setGalleryPreview(files.map((file) => URL.createObjectURL(file)));
  };

  const handleProductSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('categories', JSON.stringify(form.categories));
    formData.append('certificationTags', JSON.stringify(form.certificationTags));
    formData.append('metadata', JSON.stringify(form.metadata));
    if (imageFile) formData.append('image', imageFile);
    certFiles.forEach((file) => formData.append('certifications', file));
    galleryFiles.forEach((file) => formData.append('gallery', file));
    client.post('/api/products/farmer', formData).then(() => {
      setForm(initialForm);
      setImageFile(null);
      setCertFiles([]);
      setGalleryFiles([]);
      setGalleryPreview([]);
      loadData();
    });
  };

  const updateInventory = (productId, stock) => {
    client.patch(`/api/farmer/products/${productId}/inventory`, { stock }).then(loadData);
  };

  const togglePublish = (productId, status) => {
    client.patch(`/api/farmer/products/${productId}/publish`, { status }).then(loadData);
  };

  const resubmitProduct = (productId) => {
    client.post(`/api/products/${productId}/resubmit`).then(loadData);
  };

  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  const approvedCount = products.filter((product) => product.approvals?.status === 'approved').length;
  const pendingCount = products.filter((product) => product.approvals?.status === 'pending').length;

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <h2 className="container-title">Farmer workspace</h2>
          <p className="container-subtitle">Publish produce, manage inventory, and monitor demand.</p>
        </div>
      </div>

      <div className="dashboard-metrics">
        <div className="card metric">
          <strong>Approved products</strong>
          <span>{approvedCount}</span>
          <small>{pendingCount} awaiting review</small>
        </div>
        <div className="card metric">
          <strong>Total stock</strong>
          <span>{totalStock}</span>
          <small>{products.length} listings</small>
        </div>
        <div className="card metric">
          <strong>Orders this week</strong>
          <span>{orders.length}</span>
        </div>
      </div>

      <section className="card split">
        <div>
          <h3>Profile & payout</h3>
          <form onSubmit={handleProfileSubmit} className="stack">
            <input
              placeholder="Farm name"
              value={profile.farmName || ''}
              onChange={(event) => setProfile({ ...profile, farmName: event.target.value })}
            />
            <input
              placeholder="Location"
              value={profile.location || ''}
              onChange={(event) => setProfile({ ...profile, location: event.target.value })}
            />
            <input
              placeholder="Contact phone"
              value={profile.phone || ''}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            />
            <textarea
              placeholder="Short bio"
              value={profile.bio || ''}
              onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            />
            <input
              placeholder="Payout preference"
              value={profile.payoutPreference || ''}
              onChange={(event) => setProfile({ ...profile, payoutPreference: event.target.value })}
            />
            <button type="submit" className="btn-primary">
              Save profile
            </button>
          </form>
        </div>
        <div>
          <h3>Add product</h3>
          <form onSubmit={handleProductSubmit} className="stack">
            <input placeholder="Name" value={form.name} onChange={(event) => handleFormChange('name', event.target.value)} required />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => handleFormChange('description', event.target.value)}
              required
            />
            <div className="two-column">
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(event) => handleFormChange('price', event.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(event) => handleFormChange('stock', event.target.value)}
                required
              />
            </div>
            <select name="categories" multiple value={form.categories} onChange={handleMultiSelect}>
              {taxonomy.categories.map((cat) => (
                <option key={cat._id} value={cat.label}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              name="certificationTags"
              multiple
              value={form.certificationTags}
              onChange={handleMultiSelect}
            >
              {taxonomy.certifications.map((cert) => (
                <option key={cert._id} value={cert.label}>
                  {cert.label}
                </option>
              ))}
            </select>
            <div className="two-column">
              <input
                placeholder="Variety"
                value={form.metadata.variety}
                onChange={(event) => handleMetadataChange('variety', event.target.value)}
              />
              <input
                placeholder="Method"
                value={form.metadata.method}
                onChange={(event) => handleMetadataChange('method', event.target.value)}
              />
            </div>
            <label className="file-field">
              Hero image
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
            </label>
            <label className="file-field">
              Gallery images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => handleGalleryChange(Array.from(event.target.files || []))}
              />
            </label>
            <div className="gallery-preview">
              {galleryPreview.map((src) => (
                <img key={src} src={src} alt="Preview" loading="lazy" />
              ))}
            </div>
            <label className="file-field">
              Certifications (PDF / images)
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={(event) => setCertFiles(Array.from(event.target.files || []))}
              />
            </label>
            <button type="submit" className="btn-primary">
              Publish for review
            </button>
          </form>
        </div>
      </section>

      <section>
        <h3>Inventory</h3>
        <div className="grid product-grid">
          {products.map((product) => (
            <article key={product._id} className="card product-manage-card">
              <header>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.categories?.join(', ')}</small>
                </div>
                <span className="status-pill">{product.status}</span>
              </header>
              <p>{product.description}</p>
              <div className="two-column">
                <label>
                  Stock
                  <input
                    type="number"
                    defaultValue={product.stock}
                    onBlur={(event) => updateInventory(product._id, Number(event.target.value) || 0)}
                  />
                </label>
                <label>
                  Publish
                  <select value={product.status} onChange={(event) => togglePublish(product._id, event.target.value)}>
                    <option value="published">Published</option>
                    <option value="draft">Unpublished</option>
                  </select>
                </label>
              </div>
              {product.approvals?.status === 'rejected' && (
                <button type="button" className="btn-secondary" onClick={() => resubmitProduct(product._id)}>
                  Resubmit
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="card analytics">
        <h3>Sales analytics</h3>
        {grafanaHealthy ? (
          <iframe
            title="Grafana analytics"
            src={grafanaUrl}
            onError={() => setGrafanaHealthy(false)}
            loading="lazy"
          />
        ) : (
          <canvas ref={canvasRef} height="200" />
        )}
      </section>
    </div>
  );
};

export default FarmerDashboard;

