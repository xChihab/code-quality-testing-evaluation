import express from 'express';

import * as userController from '../controllers/userController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/users', auth, userController.getAllUsers);
router.get('/similar-usernames', auth, userController.findSimilarUsernames);

export default router;
