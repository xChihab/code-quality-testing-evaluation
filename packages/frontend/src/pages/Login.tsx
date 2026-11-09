import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { loginUser } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await loginUser(username, password);
      onLogin();
      navigate('/products');
    } catch (err) {
      setError((err as { error?: string }).error || 'An error occurred');
    }
  };

  return (
    <div className="max-w-[400px] mx-auto p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-5">Login</h2>
      {error && <div className="text-[#b71c1c] mb-2.5 p-2.5 bg-[#ffebee] rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        />
        <button type="submit" className="p-2.5 bg-[#2e7d32] text-white border-none rounded cursor-pointer">
          Login
        </button>
      </form>
      <p className="text-center mt-5">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-700 underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
