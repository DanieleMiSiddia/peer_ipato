import { Request, Response } from 'express';
import multer from 'multer';
import * as ArticoloModel from '../models/articolo.model';
import { generateId } from '../utils/generateId';

// memoryStorage: il file arriva come Buffer in req.file.buffer, salvato direttamente nel LONGBLOB
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
