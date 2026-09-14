const productController = require('../productController');
const db = require('../../db/database');

describe('Product Controller', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    jest.spyOn(db, 'getDb').mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllProducts', () => {
    test('fetches all products with calculated details', async () => {
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [{ id: 1, name: 'Item 1', price: 10, stock: 5 }]);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('COUNT(*)')) {
          callback(null, { total: 1 });
        } else if (query.includes('AVG(price)')) {
          callback(null, { avg: 10 });
        } else {
          callback(null, {});
        }
      });

      productController.getAllProducts(req, res);

      // Allow promise ticks inside loop to resolve
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: [
          expect.objectContaining({
            id: 1,
            name: 'Item 1',
            cheaperCount: 1,
            avgPrice: 10
          })
        ]
      });
    });

    test('handles db error in getAllProducts', () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Fetch error'), null);
      });

      productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fetch error' });
    });
  });

  describe('createProduct', () => {
    test('creates product successfully', () => {
      const req = { body: { name: 'New Laptop', price: 999.99, stock: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call({ lastID: 10 }, null);
      });

      productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 10,
        name: 'New Laptop',
        price: 999.99,
        stock: 5
      });
    });

    test('handles error on createProduct', () => {
      const req = { body: { name: 'Item', price: 10, stock: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Insert error'));
      });

      productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating product' });
    });
  });

  describe('getProduct', () => {
    test('retrieves single product by id', () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Product 1' });
      });

      productController.getProduct(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: { id: 1, name: 'Product 1' }
      });
    });

    test('handles error on getProduct', () => {
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Product not found'), null);
      });

      productController.getProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  describe('updateStock', () => {
    test('updates product stock successfully', () => {
      const req = { params: { id: 1 }, body: { stock: 20 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call({ changes: 1 }, null);
      });

      productController.updateStock(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    test('returns 404 if product does not exist', () => {
      const req = { params: { id: 999 }, body: { stock: 20 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.run.mockImplementation(function(query, params, callback) {
        callback.call({ changes: 0 }, null);
      });

      productController.updateStock(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    test('handles error on updateStock', () => {
      const req = { params: { id: 1 }, body: { stock: 20 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Update failed'));
      });

      productController.updateStock(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update stock' });
    });
  });
});
