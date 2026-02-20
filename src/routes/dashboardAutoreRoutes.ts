import { Router } from 'express';
import { getConferenzeAutore, getProfilo } from '../controllers/dashboardAutoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo', verificaToken, getProfilo);
router.get('/conferenze', verificaToken, getConferenzeAutore);

export default router;
