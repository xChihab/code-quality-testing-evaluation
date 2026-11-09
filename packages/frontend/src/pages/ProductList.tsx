import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { Product } from '../types';

import { getProducts } from '../services/api';

interface ProductRow extends Product {
  searchableText: string;
  priceCategory: 'cheap' | 'medium' | 'expensive';
  stockStatus: 'out' | 'low' | 'available';
}

const ProductList = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        const processedData = data.map((item): ProductRow => ({
          ...item,
          searchableText: `${item.name.toLowerCase()} ${item.price} ${item.stock}`,
          priceCategory: item.price < 50 ? 'cheap' : item.price < 100 ? 'medium' : 'expensive',
          stockStatus: item.stock === 0 ? 'out' : item.stock < 10 ? 'low' : 'available'
        }));
        setProducts(processedData);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchFiltered = products.filter((product) => {
      if (!searchTerm) return true;

      const searchWords = searchTerm.toLowerCase().split(' ');

      const searchableWords = product.searchableText.split(' ');

      return searchWords.every((searchWord) =>
        searchableWords.some((word) => {
          const normalizedWord = word.toLowerCase().trim();
          const normalizedSearch = searchWord.toLowerCase().trim();

          // Levenshtein distance calculation for fuzzy matching
          const distance = Array(normalizedWord.length + 1)
            .fill(null)
            .map(() => Array(normalizedSearch.length + 1).fill(null));

          for (let i = 0; i <= normalizedWord.length; i++) {
            distance[i][0] = i;
          }

          for (let j = 0; j <= normalizedSearch.length; j++) {
            distance[0][j] = j;
          }

          for (let i = 1; i <= normalizedWord.length; i++) {
            for (let j = 1; j <= normalizedSearch.length; j++) {
              const cost = normalizedWord[i - 1] === normalizedSearch[j - 1] ? 0 : 1;

              distance[i][j] = Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1, distance[i - 1][j - 1] + cost);
            }
          }

          // Allow for fuzzy matching with a threshold
          return distance[normalizedWord.length][normalizedSearch.length] <= 2;
        })
      );
    });

    const priceFiltered = searchFiltered.filter((product) => {
      if (!priceFilter) return true;

      const price = parseFloat(String(product.price));
      switch (priceFilter) {
        case 'low':
          return price < 50 && product.priceCategory === 'cheap';
        case 'medium':
          return price >= 50 && price < 100 && product.priceCategory === 'medium';
        case 'high':
          return price >= 100 && product.priceCategory === 'expensive';
        default:
          return true;
      }
    });

    return priceFiltered.filter((product) => {
      if (!stockFilter) return true;

      const stockNum = parseInt(String(product.stock));

      switch (stockFilter) {
        case 'out':
          return stockNum === 0 && product.stockStatus === 'out';
        case 'low':
          return stockNum > 0 && stockNum < 10 && product.stockStatus === 'low';
        case 'available':
          return stockNum >= 10 && product.stockStatus === 'available';
        default:
          return true;
      }
    });
  }, [products, searchTerm, priceFilter, stockFilter]);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link to="/add-product">
          <button className="py-2.5 px-5 bg-[#2e7d32] text-white border-none rounded cursor-pointer">
            Add Product
          </button>
        </Link>
      </div>

      <div className="flex gap-2.5 mb-5">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd] flex-1"
        />

        <label className="sr-only" htmlFor="price-filter">
          Filter products by price
        </label>
        <select
          id="price-filter"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        >
          <option value="">All Prices</option>
          <option value="low">Low (&lt; $50)</option>
          <option value="medium">Medium ($50 - $100)</option>
          <option value="high">High (&gt; $100)</option>
        </select>

        <label className="sr-only" htmlFor="stock-filter">
          Filter products by stock
        </label>
        <select
          id="stock-filter"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        >
          <option value="">All Stock</option>
          <option value="out">Out of Stock</option>
          <option value="low">Low Stock</option>
          <option value="available">Available</option>
        </select>
      </div>

      {error && <div className="text-[#b71c1c] p-2.5 bg-[#ffebee] mb-5 rounded">{error}</div>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border border-solid border-[#ddd] rounded-lg p-[15px] bg-white">
            <h3 className="text-lg font-bold m-0 mb-2.5">{product.name}</h3>
            <p className="my-[5px] text-[#666]">Price: ${product.price}</p>
            <p className={`my-[5px] ${product.stock > 0 ? 'text-[#2e7d32]' : 'text-[#b71c1c]'}`}>
              Stock: {product.stock}
            </p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="my-4 text-center text-[#666]">No products found matching your criteria</p>
      )}
    </div>
  );
};

export default ProductList;
