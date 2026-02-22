import { Router } from 'express';
import { getProfilo, getConferenzeInRevisione, visualizzaArticoli } from '../controllers/dashboardMembroPCController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo',     verificaToken, getProfilo);
router.get('/conferenze',          verificaToken, getConferenzeInRevisione);
router.get('/conferenze/:id/articoli', verificaToken, visualizzaArticoli);

export default router;
