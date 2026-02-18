import { Router } from 'express';
import { changePassword, changeEmail } from '../controllers/modController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.put('/password', verificaToken, changePassword);
router.put('/email', verificaToken, changeEmail);

export default router;
