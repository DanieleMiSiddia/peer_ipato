import { Router } from 'express';
import { modificaPassword, changeEmail } from '../controllers/modController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.put('/modificaPassword', verificaToken, modificaPassword);
router.put('/email', verificaToken, changeEmail);

export default router;
