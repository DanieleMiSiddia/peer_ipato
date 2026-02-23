import { Request, Response } from 'express';
import * as ConferenzaModel    from '../models/conferenza.model';
import * as ArticoloModel      from '../models/articolo.model';
import * as PubblicazioneModel from '../models/pubblicazione.model';
import * as RevisioneModel     from '../models/revisione.model';
import { generateId }          from '../utils/generateId';

// ============================================================
// CONTROLLER: restituisce le conferenze di cui l'utente è editore
//
// id_editore → letto dal JWT (req.user), mai dal body
// ============================================================
export const getConferenze = async (req: Request, res: Response) => {
    try {
        const id_editore = req.user!.id_utente;

        const conferenze = await ConferenzaModel.findConferenzeByEditore(id_editore);

        res.status(200).json({
            conferenze: conferenze.map(c => ({
                id_conferenza:      c.id_conferenza,
                nome:               c.nome,
                data_fine_conferenza: c.data_fine_conferenza
            }))
        });

    } catch (error) {
        console.error('Errore recupero conferenze editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce gli articoli di una conferenza
//             che non sono ancora stati pubblicati
//
// id_conferenza → path param (:idConferenza)
// id_editore    → letto dal JWT (req.user), per sicurezza
// ============================================================
export const getArticoli = async (req: Request, res: Response) => {
    try {
        const idConferenza = req.params['idConferenza'] as string;

        // 1. Preleva tutti gli articoli della conferenza (solo i 3 campi utili)
        const tutti = await ArticoloModel.findByConferenzaPerEditore(idConferenza);

        // 2. Per ogni articolo verifica se è già pubblicato e lo scarta in quel caso
        const daPublicare = await Promise.all(
            tutti.map(async (art) => {
                const pubblicato = await PubblicazioneModel.isPubblicato(art.id_articolo);
                return pubblicato ? null : art;
            })
        );

        // 3. Rimuove i null (articoli già pubblicati) dall'array
        const articoli = daPublicare.filter((art) => art !== null);

        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: download del documento PDF di un articolo
//
// id_articolo → path param (:idArticolo)
// id_editore  → letto dal JWT (req.user), usato per il check
//               di autorizzazione prima di servire il file
// ============================================================
export const downloadDocumento = async (req: Request, res: Response) => {
    try {
        const id_editore  = req.user!.id_utente;
        const id_articolo = req.params['idArticolo'] as string;

        // 1. Verifica che l'editore sia assegnato alla conferenza dell'articolo
        const autorizzato = await PubblicazioneModel.canEditoreAccessDocumento(id_articolo, id_editore);
        if (!autorizzato) {
            return res.status(403).json({ message: 'Non sei autorizzato a scaricare questo documento.' });
        }

        // 2. Recupera il buffer del documento dal DB
        const buffer = await ArticoloModel.getDocumentoById(id_articolo);
        if (!buffer) {
            return res.status(404).json({ message: 'Documento non trovato.' });
        }

        // 3. Invia il PDF con gli header appropriati
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="articolo-${id_articolo}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error('Errore download documento editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: restituisce tutte le revisioni di un articolo
//
// id_articolo → path param (:idArticolo)
// ============================================================
export const getRevisioni = async (req: Request, res: Response) => {
    try {
        const id_articolo = req.params['idArticolo'] as string;

        const revisioni = await RevisioneModel.findByArticolo(id_articolo);

        res.status(200).json({
            revisioni: revisioni.map(r => ({
                id_review:       r.id_review,
                valutazione:     r.valutazione,
                voto_competenza: r.voto_competenza,
                commento:        r.commento
            }))
        });

    } catch (error) {
        console.error('Errore recupero revisioni articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// CONTROLLER: pubblica un articolo
//
// id_articolo → path param (:idArticolo)
// id_editore  → letto dal JWT (req.user)
//
// Logica:
//   1. Recupera il limite di pubblicazioni dalla conferenza
//   2. Conta le pubblicazioni già esistenti per quella conferenza
//   3. Se il limite è raggiunto → 409
//   4. Altrimenti crea la pubblicazione
// ============================================================
export const pubblica = async (req: Request, res: Response) => {
    try {
        const id_editore  = req.user!.id_utente;
        const id_articolo = req.params['idArticolo'] as string;

        // 1. Limite massimo di pubblicazioni per la conferenza
        const limite   = await ConferenzaModel.getLimiteByArticolo(id_articolo);

        // 2. Pubblicazioni già presenti per quella conferenza
        const correnti = await PubblicazioneModel.countByConferenza(id_articolo);

        // 3. Controllo limite
        if (correnti >= limite) {
            return res.status(409).json({
                message: 'Numero massimo di pubblicazioni raggiunto per questa conferenza.'
            });
        }

        // 4. Crea la pubblicazione
        const codice_pubblicazione = generateId(10);
        await PubblicazioneModel.create(codice_pubblicazione, id_articolo, id_editore);

        res.status(201).json({ message: 'Articolo pubblicato con successo.' });

    } catch (error) {
        console.error('Errore pubblicazione articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
