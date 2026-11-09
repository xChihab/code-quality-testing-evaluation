import type { Request, Response } from 'express';
import type { RunResult } from 'sqlite3';

import * as db from '../db/database';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  cheaperCount?: number;
  avgPrice?: number;
}

export const getAllProducts = (req: Request, res: Response) => {
  const database = db.getDb();

  database.all<Product>('SELECT * FROM products', [], async function (error, products) {
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    const productsWithDetails: Product[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      await new Promise<void>((resolve) => {
        database.get<{ total: number }>(
          'SELECT COUNT(*) as total FROM products WHERE price <= ?',
          [product.price],
          (err, result) => {
            if (!err) {
              product.cheaperCount = result.total;
            }
            resolve();
          }
        );
      });

      await new Promise<void>((resolve) => {
        database.get<{ avg: number }>('SELECT AVG(price) as avg FROM products', [], (err, result) => {
          if (!err) {
            product.avgPrice = result.avg;
          }
          resolve();
        });
      });

      productsWithDetails.push(product);
    }

    res.json({
      message: 'success',
      data: productsWithDetails
    });
  });
};

export const createProduct = (req: Request, res: Response) => {
  const { name, price, stock } = req.body;
  const database = db.getDb();

  database.run(
    `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`,
    [name, price, stock],
    function (this: RunResult, err: Error | null) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating product' });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        price,
        stock
      });
    }
  );
};

export const getProduct = (req: Request, res: Response) => {
  const id = req.params.id;
  const database = db.getDb();

  database.get<Product>('SELECT * FROM products WHERE id = ?', [id], (error, result) => {
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({
      message: 'success',
      data: result
    });
  });
};

export const updateStock = (req: Request, res: Response) => {
  const { id } = req.params;
  const { stock } = req.body;
  const database = db.getDb();

  database.run(
    `UPDATE products SET stock = ? WHERE id = ?`,
    [stock, id],
    function (this: RunResult, err: Error | null) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update stock' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ success: true });
    }
  );
};
