import { Request, Response } from 'express';
import * as RevisioneModel from '../models/revisione.model';
import * as ArticoloModel  from '../models/articolo.model';
import { generateId }      from '../utils/generateId';

export const getArticoliAssegnati = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const articoli = await RevisioneModel.findArticoliAssegnati(id_utente);

        res.status(200).json({ articoli });

    } catch (error) {
        console.error('Errore recupero articoli assegnati:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const downloadDocumento = async (req: Request, res: Response) => {
    try {
        const id_revisore = req.user!.id_utente;
        const id_articolo = req.params.idArticolo as string;

        // accesso consentito se assegnato all'articolo o membro PC della conferenza
        const autorizzato = await RevisioneModel.canAccessDocumento(id_articolo, id_revisore);
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
        console.error('Errore download documento:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// media = Σ(valutazione × voto_competenza) / Σ(voto_competenza)
async function aggiornaMedia(id_articolo: string): Promise<void> {
    const valutazioni = await RevisioneModel.getValutazioniByArticolo(id_articolo);

    if (valutazioni.length === 0) return;

    const sommaPesi    = valutazioni.reduce((acc, r) => acc + r.voto_competenza, 0);
    const sommaPesata  = valutazioni.reduce((acc, r) => acc + r.valutazione * r.voto_competenza, 0);
    const media        = Math.round((sommaPesata / sommaPesi) * 100) / 100;

    await ArticoloModel.updateMediaVoti(id_articolo, media);
}

export const createRevisione = async (req: Request, res: Response) => {
    try {
        const id_revisore = req.user!.id_utente;
        const { id_articolo, voto_competenza, valutazione, commento } = req.body;

        if (!id_articolo || voto_competenza === undefined || valutazione === undefined || !commento) {
            return res.status(400).json({ message: 'Campi obbligatori mancanti.' });
        }

        const vc = Number(voto_competenza);
        const v  = Number(valutazione);

        if (isNaN(vc) || vc < 1 || vc > 3) {
            return res.status(400).json({ message: 'Il voto competenza deve essere compreso tra 1 e 3.' });
        }
        if (isNaN(v) || v < 1 || v > 5) {
            return res.status(400).json({ message: 'La valutazione deve essere compresa tra 1 e 5.' });
        }

        const giaRevisionato = await RevisioneModel.isGiaRevisionato(id_articolo, id_revisore);
        if (giaRevisionato) {
            return res.status(409).json({ message: 'Revisione dell\'articolo già eseguita.' });
        }

        await RevisioneModel.create({
            id_review:       generateId(8),
            voto_competenza: vc,
            valutazione:     v,
            commento_chair:  null,
            commento,
            stato_review:    null,
            id_revisore,
            id_articolo
        });

        await aggiornaMedia(id_articolo);

        res.status(201).json({ message: 'Revisione inviata con successo.' });

    } catch (error) {
        console.error('Errore creazione revisione:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
