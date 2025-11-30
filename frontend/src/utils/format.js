export const currency = (amount) => {
  if (amount === undefined || amount === null) return '₹ —';
  // ensure number
  const n = Number(amount);
  if (Number.isNaN(n)) return `₹ ${amount}`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};
