import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navigation from './components/Navigation';
import AddProduct from './pages/AddProduct';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import Register from './pages/Register';
import UserList from './pages/UserList';
import './styles/index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshAuth = React.useCallback(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-[#f5f5f5] p-5">
        {isAuthenticated && <Navigation onLogout={refreshAuth} />}
        <main>
          <Routes>
            <Route path="/login" element={<Login onLogin={refreshAuth} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
