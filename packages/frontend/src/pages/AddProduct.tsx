import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiError } from '../types';

import { createProduct } from '../services/api';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !price || !stock) {
      setError('All fields are required!');
      return;
    }

    try {
      await createProduct({
        name,
        price: price,
        stock: stock
      });
      navigate('/products');
    } catch (err) {
      setError((err as ApiError).response?.data?.error || 'Failed to create product');
      console.error('Error creating product:', err);
    }
  };

  return (
    <div className="max-w-[400px] mx-auto p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-5">Add New Product</h2>

      {error && <div className="text-[#b71c1c] mb-2.5 p-2.5 bg-[#ffebee] rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex-1 p-2.5 bg-[#b71c1c] text-white border-none rounded cursor-pointer"
          >
            Cancel
          </button>

          <button type="submit" className="flex-1 p-2.5 bg-[#2e7d32] text-white border-none rounded cursor-pointer">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
