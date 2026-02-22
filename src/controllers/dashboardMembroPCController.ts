import { Request, Response } from 'express';
import * as ConferenzaModel from '../models/conferenza.model';
import * as ArticoloModel   from '../models/articolo.model';
import * as UtenteModel     from '../models/utente.model';

// ============================================================
// TIPO: dati di una conferenza in fase di revisione
// restituiti al frontend della DashboardMembroPC
// ============================================================
interface ConferenzaMembroPCItem {
    id_conferenza:     string;
    nome:              string;
    data_fine_revisione: Date;
}

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
// CONTROLLER: restituisce le conferenze in cui il revisore
// è membro PC E che sono attualmente in fase di revisione
// (data_inizio_revisione <= oggi <= data_fine_revisione)
// ============================================================
export const getConferenzeInRevisione = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const tutte = await ConferenzaModel.findConferenzeByMembroPC(id_utente);

        const oggi = new Date();

        const conferenze: ConferenzaMembroPCItem[] = tutte
            .filter(c =>
                new Date(c.data_inizio_revisione) <= oggi &&
                oggi <= new Date(c.data_fine_revisione)
            )
            .map(c => ({
                id_conferenza:      c.id_conferenza,
                nome:               c.nome,
                data_fine_revisione: c.data_fine_revisione
            }));

        res.status(200).json({ conferenze });

    } catch (error) {
        console.error('Errore recupero conferenze membro PC:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce gli articoli sottomessi a una conferenza
// ============================================================
export const visualizzaArticoli = async (req: Request, res: Response) => {
    try {
        const id_conferenza = req.params.id as string;

        const articoli = await ArticoloModel.findByConferenza(id_conferenza);

        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli conferenza:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
