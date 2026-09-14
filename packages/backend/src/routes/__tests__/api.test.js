const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../userRoutes');
const productRoutes = require('../productRoutes');
const db = require('../../db/database');
const jwt = require('jsonwebtoken');

describe('API Routes Integration Tests', () => {
  let app;
  let token;
  const SECRET = 'your-super-secret-key-that-should-not-be-hardcoded';

  beforeAll(async () => {
    await db.connect();
    token = jwt.sign({ id: 1, username: 'admin' }, SECRET);

    app = express();
    app.use(bodyParser.json());
    app.use('/api/auth', userRoutes);
    app.use('/api', productRoutes);
  });

  afterAll(async () => {
    await db.closeConnection();
  });

  describe('User Routes', () => {
    test('POST /api/auth/register creates a new user', async () => {
      const username = `testuser_${Date.now()}`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123',
          firstname: 'Test',
          lastname: 'User'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('auth', true);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/auth/login logs in user', async () => {
      const username = `loginuser_${Date.now()}`;
      await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'pass',
          firstname: 'Login',
          lastname: 'User'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username, password: 'pass' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('auth', true);
      expect(res.body.user.username).toEqual(username);
    });

    test('GET /api/auth/users requires authentication', async () => {
      const resWithoutToken = await request(app).get('/api/auth/users');
      expect(resWithoutToken.statusCode).toEqual(401);

      const resWithToken = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);
      expect(resWithToken.statusCode).toEqual(200);
      expect(Array.isArray(resWithToken.body)).toBeTruthy();
    });

    test('GET /api/auth/similar-usernames returns similarity matrix', async () => {
      const res = await request(app)
        .get('/api/auth/similar-usernames')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('similar');
    });
  });

  describe('Product Routes', () => {
    let createdProductId;

    test('POST /api/products creates a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Integration Tablet', price: 299.99, stock: 12 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      createdProductId = res.body.id;
    });

    test('GET /api/products lists all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('success');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });

    test('GET /api/products/:id fetches single product', async () => {
      const res = await request(app)
        .get(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.id).toEqual(createdProductId);
    });

    test('PATCH /api/products/:id/stock updates stock', async () => {
      const res = await request(app)
        .patch(`/api/products/${createdProductId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ stock: 50 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });
  });
});
