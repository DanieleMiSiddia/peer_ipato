import { Request, Response } from 'express';
import * as RevisioneModel from '../models/revisione.model';
import * as UtenteModel    from '../models/utente.model';

// ============================================================
// CONTROLLER: restituisce il profilo dell'utente autenticato
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
        console.error('Errore recupero profilo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce gli articoli assegnati al revisore
// (fonti: e_assegnato + offerta, unificati in un'unica lista)
// ============================================================
export const getArticoliAssegnati = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const [daAssegnazione, daOfferta] = await Promise.all([
            RevisioneModel.findArticoliAssegnati(id_utente),
            RevisioneModel.findArticoliDaOfferta(id_utente)
        ]);

        const articoli = [...daAssegnazione, ...daOfferta];

        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli assegnati:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce le revisioni scritte dal revisore
// ============================================================
export const getRevisioniByRevisore = async (req: Request, res: Response) => {
    // TODO
};

// ============================================================
// CONTROLLER: inserisce una nuova revisione
// ============================================================
export const createRevisione = async (req: Request, res: Response) => {
    // TODO
};
