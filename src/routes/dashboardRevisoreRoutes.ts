import { Router } from 'express';
import { getArticoliAssegnati, createRevisione, downloadDocumento } from '../controllers/dashboardRevisoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/articoli-assegnati', verificaToken, getArticoliAssegnati);
router.post('/revisioni',         verificaToken, createRevisione);
router.get('/articoli/:idArticolo/documento', verificaToken, downloadDocumento);

export default router;
