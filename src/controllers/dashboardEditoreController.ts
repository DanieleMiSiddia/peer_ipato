import { Request, Response } from 'express';
import * as ConferenzaModel from '../models/conferenza.model';
import * as UtenteModel from '../models/utente.model';
import * as ArticoloModel from '../models/articolo.model';
import * as RevisioneModel from '../models/revisione.model';

// ============================================================
// CONTROLLER: restituisce le conferenze gestite dall'editore
// ============================================================
export const getConferenzeEditore = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // 1. Recupera le conferenze dal model con il conteggio degli articoli revisionati
        const conferenze = await ConferenzaModel.findConferenzeByEditore(id_utente);

        // 2. Restituisce l'array al frontend
        res.status(200).json({ conferenze });

    } catch (error) {
        console.error('Errore recupero conferenze editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce il profilo dell'editore
// ============================================================
export const getProfilo = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const utente = await UtenteModel.findById(id_utente);
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.status(200).json({ utente });

    } catch (error) {
        console.error('Errore recupero profilo editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce gli articoli per la gestione pubblicazioni
// ============================================================
export const getGestionePubblicazioni = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // Recupera gli articoli dal model
        const articoli = await ArticoloModel.findArticoliGestionePubblicazioni(id_utente);

        // Restituisce l'array al frontend
        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli da pubblicare:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce le revisioni di un articolo specifico
// ============================================================
export const getRevisioniArticolo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // ID Articolo

        // Recupera le revisioni dal model
        const revisioni = await RevisioneModel.findByArticolo(id as string);

        res.status(200).json({ revisioni });

    } catch (error) {
        console.error('Errore recupero revisioni:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce i dettagli di un articolo
// ============================================================
export const getDettagliArticolo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const articolo = await ArticoloModel.findById(id as string);
        if (!articolo) {
            return res.status(404).json({ message: 'Articolo non trovato' });
        }
        res.status(200).json({ articolo });
    } catch (error) {
        console.error('Errore recupero dettagli articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: gestisce la pubblicazione effettiva
// ============================================================
export const pubblicaArticolo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const id_editore = req.user!.id_utente;

        await ArticoloModel.pubblica(id as string, id_editore);

        res.status(200).json({ message: 'Articolo pubblicato con successo' });
    } catch (error) {
        console.error('Errore pubblicazione articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
