import { Router } from 'express';
import { getConferenzeInRevisione, visualizzaArticoli, assegnaSottorevisore } from '../controllers/dashboardMembroPCController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/conferenze',                       verificaToken, getConferenzeInRevisione);
router.get('/conferenze/:id/articoli',          verificaToken, visualizzaArticoli);
router.post('/articoli/:idArticolo/assegna',    verificaToken, assegnaSottorevisore);

export default router;
