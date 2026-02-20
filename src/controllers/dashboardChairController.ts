import { Request, Response } from 'express';
import * as ConferenzaModel from '../models/conferenza.model';
import { Conferenza } from '../models/conferenza.model';
import * as UtenteModel from '../models/utente.model';
import { generateId } from '../utils/generateId';

// ============================================================
// TIPO: rappresenta i dati di una conferenza elaborati
// da restituire al frontend della DashboardChair
// ============================================================
interface ConferenzaDashboardItem {
    id_conferenza: string;
    nome:          string;
    stato:         'Fase Sottomissione' | 'Fase Revisione' | 'Fase Pubblicazione';
}

// ============================================================
// FUNZIONE HELPER: calcola lo stato della conferenza
// confrontando la data odierna con le scadenze del DB
// ============================================================
function calcolaStato(
    oggi:                    Date,
    dataFineSottomissione:   Date,
    dataFineRevisione:       Date
): ConferenzaDashboardItem['stato'] {

    if (oggi <= dataFineSottomissione) return 'Fase Sottomissione';
    if (oggi <= dataFineRevisione)     return 'Fase Revisione';
    return 'Fase Pubblicazione';
}

// ============================================================
// CONTROLLER: aggiunge un co-chair a una conferenza
// ============================================================
export const insertCoChair = async (req: Request, res: Response) => {
    try {
        const id_conferenza = req.params.id as string;
        const { email } = req.body;

        // 1. Verifica che chi fa la richiesta sia chair/co-chair di questa conferenza
        const conferenza = await ConferenzaModel.findByIdForChair(id_conferenza, req.user!.id_utente);
        if (!conferenza) {
            return res.status(403).json({ message: 'Accesso non autorizzato o conferenza non trovata' });
        }

        // 2. Verifica che l'email esista e che il ruolo sia 'chair'
        const utente = await UtenteModel.findRoleByEmail(email);
        if (!utente) {
            return res.status(404).json({ message: 'Nessun utente trovato con questa email' });
        }
        if (utente.role !== 'chair') {
            return res.status(400).json({ message: 'L\'utente non ha il ruolo di Chair' });
        }

        // 3. Crea la relazione co-chair
        await ConferenzaModel.addCoChair(id_conferenza, utente.id_utente);

        res.status(201).json({ message: 'Co-chair aggiunto con successo' });

    } catch (error: any) {
        // Gestione duplicato: la coppia (id_conferenza, id_chair) esiste già
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Questo chair è già co-chair di questa conferenza' });
        }
        console.error('Errore aggiunta co-chair:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: recupera e restituisce le conferenze del Chair
// ============================================================
export const getConferenzeChair = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // 1. Recupera dal DB tutte le conferenze legate a questo Chair
        const conferenze: Conferenza[] = await ConferenzaModel.findConferenzeByChair(id_utente);

        // 2. Calcola lo stato di ciascuna conferenza e costruisce la risposta
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0); // normalizza a mezzanotte per confronto solo sulla data

        const risultato: ConferenzaDashboardItem[] = conferenze.map((conf) => ({
            id_conferenza: conf.id_conferenza,
            nome:          conf.nome,
            stato:         calcolaStato(
                               oggi,
                               new Date(conf.data_fine_sottomissione),
                               new Date(conf.data_fine_revisione)
                           )
        }));

        // 3. Restituisce l'array al frontend
        res.status(200).json({ conferenze: risultato });

    } catch (error) {
        console.error('Errore recupero conferenze chair:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce i dati di una singola conferenza
// ============================================================
export const getConferenzaById = async (req: Request, res: Response) => {
    try {
        const id_utente     = req.user!.id_utente;
        const id_conferenza = req.params.id as string;

        // Cerca la conferenza verificando che l'utente sia chair o co-chair
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
// CONTROLLER: crea una nuova conferenza
// ============================================================
export const createConferenza = async (req: Request, res: Response) => {
    try {
        // 1. L'id_chair viene letto dal token JWT, non dal body
        const id_chair = req.user!.id_utente;

        // 2. Lettura di tutti i campi inviati dal form
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

        // 3. Validazione: tutti i campi sono obbligatori
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

        // 4. Risoluzione email editore → id_editore
        const editore = await UtenteModel.findByEmail(editore_email);
        if (!editore || editore.role !== 'editore') {
            return res.status(400).json({ message: 'Editore non trovato o ruolo non corretto' });
        }
        const id_editore = editore.id_utente;

        // 5. Generazione ID univoco per la nuova conferenza (CHAR(6))
        const id_conferenza = generateId(6);

        // 6. Costruzione dell'oggetto e salvataggio nel DB
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

        // 7. Risposta al frontend con l'ID della conferenza appena creata
        res.status(201).json({ message: 'Conferenza creata con successo', id_conferenza });

    } catch (error) {
        console.error('Errore creazione conferenza:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: aggiunge un membro PC a una conferenza
// ============================================================
export const insertMembroPC = async (req: Request, res: Response) => {
    try {
        const id_conferenza = req.params.id as string;
        const { email } = req.body;

        // 1. Verifica che chi fa la richiesta sia chair/co-chair di questa conferenza
        const conferenza = await ConferenzaModel.findByIdForChair(id_conferenza, req.user!.id_utente);
        if (!conferenza) {
            return res.status(403).json({ message: 'Accesso non autorizzato o conferenza non trovata' });
        }

        // 2. Verifica che l'email esista nel sistema
        const utente = await UtenteModel.findRoleByEmail(email);
        if (!utente) {
            return res.status(404).json({ message: 'Nessun utente trovato con questa email' });
        }

        // 3. Verifica che il ruolo dell'utente sia 'revisore'
        if (utente.role !== 'revisore') {
            return res.status(400).json({ message: 'L\'utente non ha il ruolo di Revisore' });
        }

        // 4. Crea la relazione nella tabella membro_pc
        await ConferenzaModel.addMembroPC(id_conferenza, utente.id_utente);

        res.status(201).json({ message: 'Membro PC invitato con successo' });

    } catch (error: any) {
        // Gestione duplicato: la coppia (id_conferenza, id_revisore) esiste già
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Questo utente è già membro PC di questa conferenza' });
        }
        console.error('Errore aggiunta membro PC:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
