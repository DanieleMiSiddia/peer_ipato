import { Request, Response } from 'express';
import * as ConferenzaModel from '../models/conferenza.model';
import { Conferenza } from '../models/conferenza.model';
import * as UtenteModel from '../models/utente.model';

// ============================================================
// TIPO: dati conferenza restituiti alla DashboardAutore
// ============================================================
interface ConferenzaAutoreItem {
    id_conferenza: string;
    nome: string;
    scadenza: string; // data_fine_sottomissione formattata come ISO string
}

// ============================================================
// CONTROLLER: restituisce le conferenze in Fase Sottomissione
// ============================================================
export const getConferenzeAutore = async (req: Request, res: Response) => {
    try {
        // 1. Recupera tutte le conferenze attualmente in Fase Sottomissione
        const conferenze: Conferenza[] = await ConferenzaModel.findConferenzeInSottomissione();

        // 2. Mappa i dati verso il formato atteso dal frontend
        const risultato: ConferenzaAutoreItem[] = conferenze.map((conf) => ({
            id_conferenza: conf.id_conferenza,
            nome: conf.nome,
            scadenza: new Date(conf.data_fine_sottomissione).toISOString().split('T')[0]
        }));

        // 3. Restituisce l'array al frontend
        res.status(200).json({ conferenze: risultato });

    } catch (error) {
        console.error('Errore recupero conferenze autore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce il profilo dell'utente autenticato
// (riutilizzato dalla dashboard autore per il nome nell'header)
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
