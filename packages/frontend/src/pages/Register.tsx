import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import type { ApiError } from '../types';

import { registerUser } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/products');
    } catch (err) {
      setError((err as ApiError).response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mx-auto max-w-[400px] rounded-lg p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
      <h2 className="mb-5 text-center text-2xl font-bold">Register</h2>
      {error && <div className="mb-2.5 rounded bg-[#ffebee] p-2.5 text-[#b71c1c]">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          className="rounded border border-solid border-[#ddd] p-2"
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          className="rounded border border-solid border-[#ddd] p-2"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="rounded border border-solid border-[#ddd] p-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="rounded border border-solid border-[#ddd] p-2"
        />
        <button type="submit" className="cursor-pointer rounded border-none bg-[#2e7d32] p-2.5 text-white">
          Register
        </button>
      </form>
      <p className="mt-5 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-700 underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
