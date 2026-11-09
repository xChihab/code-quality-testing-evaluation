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
    <nav className="bg-[#333] p-2.5 mb-5 flex justify-between items-center">
      <div>
        <Link to="/users" className="text-white no-underline mr-5">
          Users
        </Link>
        <Link to="/products" className="text-white no-underline">
          Products
        </Link>
      </div>
      <div className="flex items-center">
        <span className="text-white mr-5">{greeting}</span>
        <button onClick={handleLogout} className="bg-[#b71c1c] text-white border-none py-2 px-4 cursor-pointer rounded">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
