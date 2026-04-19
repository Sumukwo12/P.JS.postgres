import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import InfoPage from './pages/InfoPage';
import Footer from './components/Footer';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/></div>;
  return user ? children : <Navigate to="/login"/>;
}

function AppContent() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground/>
      <div className="relative z-10">
        <Navbar/>
        <Routes>
          <Route path="/"             element={<HomePage/>}/>
          <Route path="/products"     element={<ProductsPage/>}/>
          <Route path="/products/:id" element={<ProductDetailPage/>}/>
          <Route path="/login"        element={<LoginPage/>}/>
          <Route path="/register"     element={<RegisterPage/>}/>
          <Route path="/cart"         element={<Protected><CartPage/></Protected>}/>
          <Route path="/checkout"     element={<Protected><CheckoutPage/></Protected>}/>
          <Route path="/orders"       element={<Protected><OrdersPage/></Protected>}/>
          <Route path="/admin"        element={<AdminPage/>}/>
          <Route path="/support/:type" element={<InfoPage/>}/>
          <Route path="*"             element={<Navigate to="/"/>}/>
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent/>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
