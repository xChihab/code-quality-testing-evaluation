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
    <div className="max-w-[400px] mx-auto p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-5">Register</h2>
      {error && <div className="text-[#b71c1c] mb-2.5 p-2.5 bg-[#ffebee] rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          className="p-2 rounded border border-solid border-[#ddd]"
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          className="p-2 rounded border border-solid border-[#ddd]"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="p-2 rounded border border-solid border-[#ddd]"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-2 rounded border border-solid border-[#ddd]"
        />
        <button type="submit" className="p-2.5 bg-[#2e7d32] text-white border-none rounded cursor-pointer">
          Register
        </button>
      </form>
      <p className="text-center mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-700 underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
