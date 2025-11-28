import { Routes, Route, Navigate } from 'react-router-dom';
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
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useAuthStore } from './store/authStore.js';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/catalog" replace />;
  return children;
};

const App = () => (
  <div className="app-shell">
    <Header />
    <main className="app-main">
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cart" element={<CartPage />} />
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
    </main>
    <Footer />
  </div>
);

export default App;

