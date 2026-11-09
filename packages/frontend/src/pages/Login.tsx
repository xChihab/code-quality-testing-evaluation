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
    <div className="mx-auto max-w-[400px] rounded-lg p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
      <h2 className="mb-5 text-center text-2xl font-bold">Login</h2>
      {error && <div className="mb-2.5 rounded bg-[#ffebee] p-2.5 text-[#b71c1c]">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded border border-solid border-[#ddd] p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-solid border-[#ddd] p-2"
        />
        <button type="submit" className="cursor-pointer rounded border-none bg-[#2e7d32] p-2.5 text-white">
          Login
        </button>
      </form>
      <p className="mt-5 text-center">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-700 underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
