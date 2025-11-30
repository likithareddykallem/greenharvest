// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';

import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CustomerOrdersPage from './pages/CustomerOrdersPage.jsx';
import FarmerOrdersPage from './pages/FarmerOrdersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import { useAuthStore } from './store/authStore.js';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard if role doesn't match
    if (user.role === 'farmer') return <Navigate to="/farmer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/catalog" replace />;
  }
  return children;
};

// New component to strictly redirect Farmers/Admins away from Customer pages
const CustomerRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (user?.role === 'farmer') return <Navigate to="/farmer" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

import ToastContainer from './components/ToastContainer.jsx';

const App = () => (
  <Layout>
    <ToastContainer />
    <Routes>
      {/* Public / Customer Routes */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/home"
        element={
          <CustomerRoute>
            <HomePage />
          </CustomerRoute>
        }
      />
      <Route
        path="/catalog"
        element={
          <CustomerRoute>
            <CatalogPage />
          </CustomerRoute>
        }
      />
      <Route
        path="/product/:id"
        element={
          <CustomerRoute>
            <ProductDetailPage />
          </CustomerRoute>
        }
      />

      {/* Auth Routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Customer Only Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute roles={['customer']}>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute roles={['customer']}>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute roles={['customer']}>
            <CustomerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute roles={['customer']}>
            <OrderTrackingPage />
          </ProtectedRoute>
        }
      />

      {/* Farmer Routes */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute roles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute roles={['farmer']}>
            <FarmerOrdersPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Layout>
);

export default App;
