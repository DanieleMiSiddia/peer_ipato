import { Router } from 'express';
import { getConferenzeChair, createConferenza } from '../controllers/dashboardChairController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/conferenze',  verificaToken, getConferenzeChair);
router.post('/conferenze', verificaToken, createConferenza);

export default router;
