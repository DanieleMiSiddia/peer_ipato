import { Router } from 'express';
import { sottomettiArticolo, getMieiArticoli, deleteArticolo, upload } from '../controllers/articoloController';
import { verificaToken } from '../middlewares/authMiddleware';

const router = Router();

// upload.single('documento') → multer intercetta il campo "documento"
// della FormData e lo rende disponibile in req.file
router.get('/miei',        verificaToken, getMieiArticoli);
router.post('/',           verificaToken, upload.single('documento'), sottomettiArticolo);
router.delete('/:id',      verificaToken, deleteArticolo);

export default router;
