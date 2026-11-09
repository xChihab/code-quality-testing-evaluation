import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../services/api';

interface NavigationProps {
  onLogout: () => void;
}

const Navigation = ({ onLogout }: NavigationProps) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const randomEmoji = ['👋', '😊', '🌟', '✨'][Math.floor(Math.random() * 4)];
    return `Good ${timeOfDay}, ${user.firstname || 'User'} ${randomEmoji}`;
  })();

  return (
    <nav className="mb-5 flex items-center justify-between bg-[#333] p-2.5">
      <div>
        <Link to="/users" className="mr-5 text-white no-underline">
          Users
        </Link>
        <Link to="/products" className="text-white no-underline">
          Products
        </Link>
      </div>
      <div className="flex items-center">
        <span className="mr-5 text-white">{greeting}</span>
        <button onClick={handleLogout} className="cursor-pointer rounded border-none bg-[#b71c1c] px-4 py-2 text-white">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
