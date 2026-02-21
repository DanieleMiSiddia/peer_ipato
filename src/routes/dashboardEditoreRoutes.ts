import { Router } from 'express';
import { getConferenzeEditore, getProfilo, getGestionePubblicazioni, getRevisioniArticolo, getDettagliArticolo, pubblicaArticolo } from '../controllers/dashboardEditoreController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

// Tutte le rotte sono protette da verificaToken
router.get('/profilo', verificaToken, getProfilo);
router.get('/conferenze', verificaToken, getConferenzeEditore);
router.get('/gestione-pubblicazioni', verificaToken, getGestionePubblicazioni);
router.get('/articoli/:id/revisioni', verificaToken, getRevisioniArticolo);
router.get('/articoli/:id', verificaToken, getDettagliArticolo);
router.post('/articoli/:id/pubblica', verificaToken, pubblicaArticolo);

export default router;
