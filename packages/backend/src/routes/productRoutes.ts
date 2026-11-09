import express, { type NextFunction, type Request, type Response } from 'express';

import * as productController from '../controllers/productController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/products', auth, productController.getAllProducts);
router.post('/products', auth, productController.createProduct);
router.get('/products/:id', auth, productController.getProduct);
router.patch('/products/:id/stock', auth, productController.updateStock);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default router;
