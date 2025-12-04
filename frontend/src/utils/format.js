import { baseURL } from '../api/client.js';

export const currency = (amount) => {
  if (amount === undefined || amount === null) return '₹ —';
  // ensure number
  const n = Number(amount);
  if (Number.isNaN(n)) return `₹ ${amount}`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

export const getImageUrl = (path) => {
  if (!path) return '/images/placeholder-veg.jpg';
  if (path.startsWith('/uploads')) {
    const host = baseURL.replace(/\/api$/, '');
    const url = `${host}${path}?v=${Date.now()}`;
    return url;
  }
  return path;
};
