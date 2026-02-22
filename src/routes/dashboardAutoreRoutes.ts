import { Router } from 'express';
import { getProfilo, getConferenzeSottomissione } from '../controllers/dashboardAutoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo',     verificaToken, getProfilo);
router.get('/conferenze',  verificaToken, getConferenzeSottomissione);

export default router;
