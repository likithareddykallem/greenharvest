import { Router } from 'express';
import { register, login, refresh } from '../controllers/authController.js';
import { loginLimiter } from '../middlewares/loginLimiter.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);

export default router;

