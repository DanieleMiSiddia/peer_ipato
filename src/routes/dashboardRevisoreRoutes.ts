import { Router } from 'express';
import { getProfilo, getArticoliAssegnati, getRevisioniByRevisore } from '../controllers/dashboardRevisoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo',            verificaToken, getProfilo);
router.get('/articoli-assegnati', verificaToken, getArticoliAssegnati);
router.get('/revisioni',          verificaToken, getRevisioniByRevisore);

export default router;
