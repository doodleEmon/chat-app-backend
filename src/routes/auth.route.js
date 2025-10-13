import express from 'express';
import { checkAuth, login, logout, searchUsers, signUp, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signUp);

router.post('/login', login);

router.post('/logout', logout);

router.put('/update-profile', protectRoute, updateProfile);

router.get('/check', protectRoute, checkAuth);

router.get('/search', protectRoute, searchUsers);

export default router;