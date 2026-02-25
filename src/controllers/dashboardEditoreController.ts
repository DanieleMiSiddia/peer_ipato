import { Request, Response } from 'express';
import * as ConferenzaModel    from '../models/conferenza.model';
import * as ArticoloModel      from '../models/articolo.model';
import * as PubblicazioneModel from '../models/pubblicazione.model';
import * as RevisioneModel     from '../models/revisione.model';
import { generateId }          from '../utils/generateId';

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

export const getArticoli = async (req: Request, res: Response) => {
    try {
        const idConferenza = req.params['idConferenza'] as string;

        const tutti = await ArticoloModel.findByConferenzaPerEditore(idConferenza);

        // filtra gli articoli già pubblicati
        const daPublicare = await Promise.all(
            tutti.map(async (art) => {
                const pubblicato = await PubblicazioneModel.isPubblicato(art.id_articolo);
                return pubblicato ? null : art;
            })
        );

        const articoli = daPublicare.filter((art) => art !== null);

        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const downloadDocumento = async (req: Request, res: Response) => {
    try {
        const id_editore  = req.user!.id_utente;
        const id_articolo = req.params['idArticolo'] as string;

        // accesso consentito solo se l'editore è assegnato alla conferenza dell'articolo
        const autorizzato = await PubblicazioneModel.canEditoreAccessDocumento(id_articolo, id_editore);
        if (!autorizzato) {
            return res.status(403).json({ message: 'Non sei autorizzato a scaricare questo documento.' });
        }

        const buffer = await ArticoloModel.getDocumentoById(id_articolo);
        if (!buffer) {
            return res.status(404).json({ message: 'Documento non trovato.' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="articolo-${id_articolo}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error('Errore download documento editore:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

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

export const pubblica = async (req: Request, res: Response) => {
    try {
        const id_editore  = req.user!.id_utente;
        const id_articolo = req.params['idArticolo'] as string;

        const limite   = await ConferenzaModel.getLimiteByArticolo(id_articolo);
        const correnti = await PubblicazioneModel.countByConferenza(id_articolo);

        if (correnti >= limite) {
            return res.status(409).json({
                message: 'Numero massimo di pubblicazioni raggiunto per questa conferenza.'
            });
        }

        const codice_pubblicazione = generateId(10);
        await PubblicazioneModel.create(codice_pubblicazione, id_articolo, id_editore);

        res.status(201).json({ message: 'Articolo pubblicato con successo.' });

    } catch (error) {
        console.error('Errore pubblicazione articolo:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
