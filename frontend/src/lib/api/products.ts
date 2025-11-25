import { apiFetch } from '../api-client';
import type { Product } from '../types';

type ProductQuery = {
  search?: string;
  category?: string;
  status?: string;
  farmer?: string;
  page?: number;
  limit?: number;
};

const buildQuery = (params: ProductQuery = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export async function fetchProducts(params: ProductQuery = {}) {
  return apiFetch<Product[]>(`/products${buildQuery(params)}`);
}

export async function fetchProductDetail(id: string) {
  return apiFetch<Product>(`/products/${id}`);
}







