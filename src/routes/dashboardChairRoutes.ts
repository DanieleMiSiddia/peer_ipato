import { Router } from 'express';
import { getConferenzeChair, createConferenza, getProfilo, getConferenzaById, insertCoChair, insertMembroPC } from '../controllers/dashboardChairController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profilo',     verificaToken, getProfilo);
router.get('/conferenze',     verificaToken, getConferenzeChair);
router.get('/conferenze/:id',          verificaToken, getConferenzaById);
router.post('/conferenze',             verificaToken, createConferenza);
router.post('/conferenze/:id/co-chair',   verificaToken, insertCoChair);
router.post('/conferenze/:id/membro-pc',  verificaToken, insertMembroPC);

export default router;
