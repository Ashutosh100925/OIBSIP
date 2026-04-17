import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const pizzaService = {
  getMenu: () => api.get('/menu'),
  getIngredients: () => api.get('/inventory'),
};

export const orderService = {
  createRazorpayOrder: (amount) => api.post('/orders/create-razorpay-order', { totalAmount: amount }),
  verifyPayment: (paymentData) => api.post('/orders/verify-payment', paymentData),
  getUserOrders: () => api.get('/users/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
};

export default api;
