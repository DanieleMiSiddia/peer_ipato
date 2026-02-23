import { Request, Response } from 'express';
import * as ConferenzaModel from '../models/conferenza.model';
import * as ArticoloModel   from '../models/articolo.model';
import * as UtenteModel     from '../models/utente.model';
import * as RevisioneModel  from '../models/revisione.model';

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

// ============================================================
// CONTROLLER: assegna un sotto-revisore a un articolo
//
// Body: { email_revisore, id_conferenza }
// Params: { idArticolo }
//
// Flusso:
//   1. Verifica che esista un revisore con quella email
//   2. Verifica che non sia già membro PC della conferenza
//   3. Verifica che l'articolo non sia già assegnato a quel revisore
//   4. Crea la relazione in e_assegnato
// ============================================================
export const assegnaSottorevisore = async (req: Request, res: Response) => {
    try {
        const id_articolo                    = req.params.idArticolo as string;
        const { email_revisore, id_conferenza } = req.body;

        // 1. Verifica esistenza revisore
        const revisore = await UtenteModel.findRevisoreByEmail(email_revisore);
        if (!revisore) {
            return res.status(404).json({
                message: 'Nessun revisore trovato con questa email.'
            });
        }

        // 2. Verifica che non sia già membro PC di questa conferenza
        const membroPC = await ConferenzaModel.isMembroPC(id_conferenza, revisore.id_utente);
        if (membroPC) {
            return res.status(409).json({
                message: 'Il revisore è già membro PC di questa conferenza.'
            });
        }

        // 3. Verifica che l'articolo non sia già assegnato a questo revisore
        const giaAssegnato = await RevisioneModel.isGiaAssegnato(id_articolo, revisore.id_utente);
        if (giaAssegnato) {
            return res.status(409).json({
                message: 'Questo articolo è già assegnato al revisore indicato.'
            });
        }

        // 4. Crea l'assegnazione
        await RevisioneModel.assegnaRevisore(id_articolo, revisore.id_utente);

        res.status(201).json({
            message: `Articolo assegnato con successo a ${revisore.nome} ${revisore.cognome}.`
        });

    } catch (error) {
        console.error('Errore assegnazione sotto-revisore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
