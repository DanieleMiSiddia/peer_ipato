import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verificaToken, logout);

export default router;
