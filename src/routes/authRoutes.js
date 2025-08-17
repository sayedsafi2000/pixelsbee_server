import express from 'express';
import { register, login, createAdmin, debugUser, listAllUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin); // Temporary endpoint for testing
router.get('/debug-user', debugUser); // Temporary debug endpoint
router.get('/list-users', listAllUsers); // Temporary endpoint to list all users

export default router; 