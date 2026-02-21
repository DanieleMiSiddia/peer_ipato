import { Router } from 'express';
import { getConferenzeAutore, getProfilo, getArticoliAutore } from '../controllers/dashboardAutoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo', verificaToken, getProfilo);
router.get('/conferenze', verificaToken, getConferenzeAutore);
router.get('/articoli', verificaToken, getArticoliAutore);

export default router;
