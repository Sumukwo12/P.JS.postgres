import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const profileAPI = {
  get: () => API.get('/profile'),
  update: (d) => API.put('/profile', d),
};

export const authAPI = {
  register: (d) => API.post('/auth/register', d),
  login: (d) => API.post('/auth/login', d),
  me: () => API.get('/auth/me'),
};

export const productsAPI = {
  list: (p) => API.get('/products', { params: p }),
  get: (id) => API.get(`/products/${id}`),
  categories: () => API.get('/products/categories/all'),
  create: (d) => API.post('/products', d),
  update: (id, d) => API.put(`/products/${id}`, d),
  delete: (id) => API.delete(`/products/${id}`),
};

export const cartAPI = {
  get: () => API.get('/cart'),
  add: (d) => API.post('/cart', d),
  update: (id, q) => API.put(`/cart/${id}?quantity=${q}`),
  remove: (id) => API.delete(`/cart/${id}`),
  clear: () => API.delete('/cart'),
};

export const ordersAPI = {
  create: (d) => API.post('/orders', d),
  list: () => API.get('/orders'),
  get: (id) => API.get(`/orders/${id}`),
};

export const paymentAPI = {
  mpesa: (d) => API.post('/payment/mpesa', d),
  status: (id) => API.get(`/payment/status/${id}`),
};

export const adminAPI = {
  stats: () => API.get('/admin/stats'),
  users: () => API.get('/admin/users'),
  orders: () => API.get('/admin/orders'),
  updateStatus: (id, s) => API.put(`/admin/orders/${id}/status?status=${s}`),
};

export const policiesAPI = {
  list: () => API.get('/policies'),
  get: (slug) => API.get(`/policies/${slug}`),
  create: (d) => API.post('/policies', d),
  update: (id, d) => API.put(`/policies/${id}`, d),
  delete: (id) => API.delete(`/policies/${id}`),
};

export default API;
