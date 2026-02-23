import { Router } from 'express';
import { getConferenze, getArticoli, downloadDocumento, getRevisioni, pubblica } from '../controllers/dashboardEditoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/conferenze',                        verificaToken, getConferenze);
router.get('/conferenze/:idConferenza/articoli',  verificaToken, getArticoli);
router.get('/articoli/:idArticolo/documento',     verificaToken, downloadDocumento);
router.get('/articoli/:idArticolo/revisioni',     verificaToken, getRevisioni);
router.post('/articoli/:idArticolo/pubblica',     verificaToken, pubblica);

export default router;
