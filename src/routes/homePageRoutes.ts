import { Router } from 'express';
import { getHomePage, getDashboard } from '../controllers/homePageController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo',   verificaToken, getHomePage);
router.get('/dashboard', verificaToken, getDashboard);

export default router;
