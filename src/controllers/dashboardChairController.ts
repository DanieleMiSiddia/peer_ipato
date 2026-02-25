import { Request, Response } from 'express';
import * as ConferenzaModel    from '../models/conferenza.model';
import { Conferenza }          from '../models/conferenza.model';
import * as UtenteModel        from '../models/utente.model';
import * as PubblicazioneModel from '../models/pubblicazione.model';
import { generateId }          from '../utils/generateId';

interface ConferenzaDashboardItem {
    id_conferenza: string;
    nome:          string;
    stato:         'Fase Sottomissione' | 'Fase Revisione' | 'Fase Pubblicazione' | 'Terminata';
}

function calcolaStato(
    oggi:                    Date,
    dataFineSottomissione:   Date,
    dataFineRevisione:       Date,
    dataFineConferenza:      Date
): ConferenzaDashboardItem['stato'] {
    if (oggi <= dataFineSottomissione) return 'Fase Sottomissione';
    if (oggi <= dataFineRevisione)     return 'Fase Revisione';
    if (oggi <= dataFineConferenza)    return 'Fase Pubblicazione';
    return 'Terminata';
}

export const insertCoChair = async (req: Request, res: Response) => {
    try {
        const id_conferenza = req.params.id as string;
        const { email } = req.body;

        const conferenza = await ConferenzaModel.findByIdForChair(id_conferenza, req.user!.id_utente);
        if (!conferenza) {
            return res.status(403).json({ message: 'Accesso non autorizzato o conferenza non trovata' });
        }

        const utente = await UtenteModel.findRoleByEmail(email);
        if (!utente) {
            return res.status(404).json({ message: 'Nessun utente trovato con questa email' });
        }
        if (utente.role !== 'chair') {
            return res.status(400).json({ message: 'L\'utente non ha il ruolo di Chair' });
        }

        await ConferenzaModel.addCoChair(id_conferenza, utente.id_utente);

        res.status(201).json({ message: 'Co-chair aggiunto con successo' });

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Questo chair è già co-chair di questa conferenza' });
        }
        console.error('Errore aggiunta co-chair:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const getConferenzeChair = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const conferenze: Conferenza[] = await ConferenzaModel.findConferenzeByChair(id_utente);

        // normalizza a mezzanotte per confronto solo sulla data
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        const risultato: ConferenzaDashboardItem[] = conferenze.map((conf) => ({
            id_conferenza: conf.id_conferenza,
            nome:          conf.nome,
            stato:         calcolaStato(
                               oggi,
                               new Date(conf.data_fine_sottomissione),
                               new Date(conf.data_fine_revisione),
                               new Date(conf.data_fine_conferenza)
                           )
        }));

        res.status(200).json({ conferenze: risultato });

    } catch (error) {
        console.error('Errore recupero conferenze chair:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const getConferenzaById = async (req: Request, res: Response) => {
    try {
        const id_utente     = req.user!.id_utente;
        const id_conferenza = req.params.id as string;

        // restituisce null sia se non esiste sia se l'utente non è chair/co-chair
        const conferenza = await ConferenzaModel.findByIdForChair(id_conferenza, id_utente);

        if (!conferenza) {
            return res.status(404).json({ message: 'Conferenza non trovata o accesso non autorizzato' });
        }

        res.status(200).json({ conferenza });

    } catch (error) {
        console.error('Errore recupero conferenza:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const createConferenza = async (req: Request, res: Response) => {
    try {
        const id_chair = req.user!.id_utente;

        const {
            nome,
            topic,
            numero_articoli,
            editore_email,
            data_inizio_conferenza,
            data_fine_conferenza,
            data_inizio_revisione,
            data_fine_revisione,
            data_inizio_sottomissione,
            data_fine_sottomissione
        } = req.body;

        if (
            !nome                      ||
            !topic                     ||
            !numero_articoli           ||
            !editore_email             ||
            !data_inizio_conferenza    ||
            !data_fine_conferenza      ||
            !data_inizio_revisione     ||
            !data_fine_revisione       ||
            !data_inizio_sottomissione ||
            !data_fine_sottomissione
        ) {
            return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
        }

        // risolve email → id e verifica ruolo editore
        const editore = await UtenteModel.findByEmail(editore_email);
        if (!editore || editore.role !== 'editore') {
            return res.status(400).json({ message: 'Editore non trovato o ruolo non corretto' });
        }
        const id_editore = editore.id_utente;

        const id_conferenza = generateId(6);

        await ConferenzaModel.create({
            id_conferenza,
            nome,
            topic,
            numero_articoli:           Number(numero_articoli),
            id_chair,
            id_editore,
            data_inizio_conferenza:    new Date(data_inizio_conferenza),
            data_fine_conferenza:      new Date(data_fine_conferenza),
            data_inizio_revisione:     new Date(data_inizio_revisione),
            data_fine_revisione:       new Date(data_fine_revisione),
            data_inizio_sottomissione: new Date(data_inizio_sottomissione),
            data_fine_sottomissione:   new Date(data_fine_sottomissione)
        });

        res.status(201).json({ message: 'Conferenza creata con successo', id_conferenza });

    } catch (error) {
        console.error('Errore creazione conferenza:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const insertMembroPC = async (req: Request, res: Response) => {
    try {
        const id_conferenza = req.params.id as string;
        const { email } = req.body;

        const conferenza = await ConferenzaModel.findByIdForChair(id_conferenza, req.user!.id_utente);
        if (!conferenza) {
            return res.status(403).json({ message: 'Accesso non autorizzato o conferenza non trovata' });
        }

        const utente = await UtenteModel.findRoleByEmail(email);
        if (!utente) {
            return res.status(404).json({ message: 'Nessun utente trovato con questa email' });
        }

        if (utente.role !== 'revisore') {
            return res.status(400).json({ message: 'L\'utente non ha il ruolo di Revisore' });
        }

        await ConferenzaModel.addMembroPC(id_conferenza, utente.id_utente);

        res.status(201).json({ message: 'Membro PC invitato con successo' });

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Questo utente è già membro PC di questa conferenza' });
        }
        console.error('Errore aggiunta membro PC:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const getArticoliPubblicati = async (req: Request, res: Response) => {
    try {
        const id_utente     = req.user!.id_utente;
        const id_conferenza = req.params.id as string;

        const conferenza = await ConferenzaModel.findByIdForChair(id_conferenza, id_utente);
        if (!conferenza) {
            return res.status(403).json({ message: 'Accesso non autorizzato o conferenza non trovata.' });
        }

        const articoli = await PubblicazioneModel.findPubblicatiByConferenza(id_conferenza);

        res.status(200).json({
            articoli: articoli.map(a => ({
                id_articolo: a.id_articolo,
                titolo:      a.titolo,
                media_voti:  a.media_voti
            }))
        });

    } catch (error) {
        console.error('Errore recupero articoli pubblicati:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
