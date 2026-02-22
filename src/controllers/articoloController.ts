import { Request, Response } from 'express';
import multer from 'multer';
import * as ArticoloModel from '../models/articolo.model';
import { generateId } from '../utils/generateId';

// ============================================================
// MULTER — memoryStorage: il file arriva come Buffer in
// req.file.buffer, pronto per essere inserito nel LONGBLOB
// senza passaggi intermedi su disco.
// ============================================================
export const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 16 * 1024 * 1024 }, // 16 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo file PDF sono accettati'));
        }
    }
});

// ============================================================
// CONTROLLER: sottomissione di un nuovo articolo
//
// Riceve da FormData:
//   - documento    → req.file     (gestito da multer)
//   - titolo       → req.body.titolo
//   - topic        → req.body.topic
//   - id_conferenza → req.body.id_conferenza
//   - id_autore    → req.user (dal token JWT)
// ============================================================
// ============================================================
// CONTROLLER: lista articoli sottomessi dall'autore autenticato
//
// L'id_autore viene letto dal token JWT (req.user) e non dal
// client, per garantire che ogni autore veda solo i propri articoli.
// Restituisce: titolo, id_conferenza, topic.
// ============================================================
export const getMieiArticoli = async (req: Request, res: Response) => {
    try {
        const id_autore = req.user!.id_utente;

        const tutti = await ArticoloModel.findByIdAutore(id_autore);

        const articoli = tutti.map(a => ({
            id_articolo:   a.id_articolo,
            titolo:        a.titolo,
            id_conferenza: a.id_conferenza,
            topic:         a.topic,
            stato:         a.stato
        }));

        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli autore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const deleteArticolo = async (req: Request, res: Response) => {
    try {
        const id_autore   = req.user!.id_utente;
        const id_articolo = req.params.id as string;

        const eliminato = await ArticoloModel.deleteById(id_articolo, id_autore);

        if (!eliminato) {
            return res.status(404).json({ message: 'Articolo non trovato o non autorizzato' });
        }

        res.status(200).json({ message: 'Articolo eliminato con successo' });

    } catch (error) {
        console.error('Errore eliminazione articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const sottomettiArticolo = async (req: Request, res: Response) => {
    try {
        const id_autore     = req.user!.id_utente;
        const { titolo, topic, id_conferenza } = req.body;
        const file = req.file;

        // Validazione campi obbligatori
        if (!file) {
            return res.status(400).json({ message: 'Documento mancante' });
        }
        if (!titolo || !topic || !id_conferenza) {
            return res.status(400).json({ message: 'Campi obbligatori mancanti (titolo, topic, id_conferenza)' });
        }

        const id_articolo = generateId(8);

        await ArticoloModel.create({
            id_articolo,
            titolo,
            topic,
            documento:    file.buffer,
            id_autore,
            id_conferenza
        });

        res.status(201).json({ message: 'Articolo sottomesso con successo', id_articolo });

    } catch (error) {
        console.error('Errore sottomissione articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
