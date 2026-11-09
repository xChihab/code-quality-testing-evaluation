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
    <div className="mx-auto max-w-[400px] rounded-lg p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
      <h2 className="mb-5 text-center text-2xl font-bold">Add New Product</h2>

      {error && <div className="mb-2.5 rounded bg-[#ffebee] p-2.5 text-[#b71c1c]">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-solid border-[#ddd] p-2"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded border border-solid border-[#ddd] p-2"
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="rounded border border-solid border-[#ddd] p-2"
        />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex-1 cursor-pointer rounded border-none bg-[#b71c1c] p-2.5 text-white"
          >
            Cancel
          </button>

          <button type="submit" className="flex-1 cursor-pointer rounded border-none bg-[#2e7d32] p-2.5 text-white">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
