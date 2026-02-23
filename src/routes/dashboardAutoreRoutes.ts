import { Router } from 'express';
import { getConferenzeSottomissione } from '../controllers/dashboardAutoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/conferenze',  verificaToken, getConferenzeSottomissione);

export default router;
