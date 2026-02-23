import { Request, Response } from 'express';
import * as RevisioneModel from '../models/revisione.model';
import * as ArticoloModel  from '../models/articolo.model';
import { generateId }      from '../utils/generateId';

// ============================================================
// CONTROLLER: restituisce gli articoli assegnati al revisore
// (fonte: e_assegnato)
// ============================================================
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

// ============================================================
// CONTROLLER: download del documento PDF di un articolo
//
// Accessibile solo se il revisore autenticato:
//   - è assegnato all'articolo (e_assegnato), oppure
//   - è membro PC della conferenza dell'articolo
// ============================================================
export const downloadDocumento = async (req: Request, res: Response) => {
    try {
        const id_revisore = req.user!.id_utente;
        const id_articolo = req.params.idArticolo as string;

        // 1. Verifica autorizzazione
        const autorizzato = await RevisioneModel.canAccessDocumento(id_articolo, id_revisore);
        if (!autorizzato) {
            return res.status(403).json({ message: 'Non sei autorizzato a scaricare questo documento.' });
        }

        // 2. Recupera il documento
        const buffer = await ArticoloModel.getDocumentoById(id_articolo);
        if (!buffer) {
            return res.status(404).json({ message: 'Documento non trovato.' });
        }

        // 3. Invia il PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="articolo-${id_articolo}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error('Errore download documento:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// ============================================================
// HELPER: calcola e aggiorna la media ponderata dell'articolo
//
// media = Σ(valutazione_i × voto_competenza_i) / Σ(voto_competenza_i)
// ============================================================
async function aggiornaMedia(id_articolo: string): Promise<void> {
    const valutazioni = await RevisioneModel.getValutazioniByArticolo(id_articolo);

    if (valutazioni.length === 0) return;

    const sommaPesi    = valutazioni.reduce((acc, r) => acc + r.voto_competenza, 0);
    const sommaPesata  = valutazioni.reduce((acc, r) => acc + r.valutazione * r.voto_competenza, 0);
    const media        = Math.round((sommaPesata / sommaPesi) * 100) / 100;

    await ArticoloModel.updateMediaVoti(id_articolo, media);
}

// ============================================================
// CONTROLLER: inserisce una nuova revisione
//
// Body: { id_articolo, voto_competenza, valutazione, commento }
// id_revisore → letto dal JWT (req.user), non dal body
// ============================================================
export const createRevisione = async (req: Request, res: Response) => {
    try {
        const id_revisore = req.user!.id_utente;
        const { id_articolo, voto_competenza, valutazione, commento } = req.body;

        // 1. Validazione campi obbligatori
        if (!id_articolo || voto_competenza === undefined || valutazione === undefined || !commento) {
            return res.status(400).json({ message: 'Campi obbligatori mancanti.' });
        }

        // 2. Validazione range voti
        //    voto_competenza: 1–3 (Base / Intermedia / Esperto)
        //    valutazione:     1–5 (stelle)
        const vc = Number(voto_competenza);
        const v  = Number(valutazione);

        if (isNaN(vc) || vc < 1 || vc > 3) {
            return res.status(400).json({ message: 'Il voto competenza deve essere compreso tra 1 e 3.' });
        }
        if (isNaN(v) || v < 1 || v > 5) {
            return res.status(400).json({ message: 'La valutazione deve essere compresa tra 1 e 5.' });
        }

        // 3. Verifica che la revisione non sia già stata eseguita
        const giaRevisionato = await RevisioneModel.isGiaRevisionato(id_articolo, id_revisore);
        if (giaRevisionato) {
            return res.status(409).json({ message: 'Revisione dell\'articolo già eseguita.' });
        }

        // 4. Crea la revisione
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

        // 5. Aggiorna la media ponderata dell'articolo
        await aggiornaMedia(id_articolo);

        res.status(201).json({ message: 'Revisione inviata con successo.' });

    } catch (error) {
        console.error('Errore creazione revisione:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
