import { Request, Response } from 'express';
import * as ConferenzaModel from '../models/conferenza.model';
import * as ArticoloModel   from '../models/articolo.model';
// ============================================================
// TIPO: dati di una conferenza in fase di sottomissione
// restituiti al frontend della DashboardAutore
// ============================================================
interface ConferenzaAutoreItem {
    id_conferenza:          string;
    nome:                   string;
    data_fine_sottomissione: Date;
    topic:                  string;
}

// ============================================================
// CONTROLLER: restituisce le conferenze in fase di sottomissione
// nelle quali l'autore NON ha ancora sottomesso alcun articolo.
//
// Logica:
// 1. findConferenze()                  → tutte le conferenze nel DB
// 2. filtro per fase di sottomissione  → data_inizio <= oggi <= data_fine
// 3. findIdConferenzaByIdAutore()      → id conferenze già frequentate
// 4. esclude le conferenze già frequentate dalla lista filtrata
// 5. mappa al tipo ConferenzaAutoreItem e risponde
// ============================================================
export const getConferenzeSottomissione = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const [tutte, giaSottomesse] = await Promise.all([
            ConferenzaModel.findConferenze(),
            ArticoloModel.findIdConferenzaByIdAutore(id_utente)
        ]);

        const oggi = new Date();
        const setGiaSottomesse = new Set(giaSottomesse);

        const conferenze: ConferenzaAutoreItem[] = tutte
            .filter(c =>
                new Date(c.data_inizio_sottomissione) <= oggi &&
                oggi <= new Date(c.data_fine_sottomissione) &&
                !setGiaSottomesse.has(c.id_conferenza)
            )
            .map(c => ({
                id_conferenza:           c.id_conferenza,
                nome:                    c.nome,
                data_fine_sottomissione: c.data_fine_sottomissione,
                topic:                   c.topic
            }));

        res.status(200).json({ conferenze });

    } catch (error) {
        console.error('Errore recupero conferenze autore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
