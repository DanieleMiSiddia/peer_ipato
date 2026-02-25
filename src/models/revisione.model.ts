import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

export interface Revisione {
    id_review:       string;
    voto_competenza: number;
    valutazione:     number;
    commento_chair:  string | null;
    commento:        string;
    stato_review:    number | null;
    id_revisore:     string;
    id_articolo:     string;
}

export interface ArticoloAssegnato {
    id_articolo:         string;
    titolo:              string;
    stato:               string;
    topic:               string;
    media_voti:          number;
    id_conferenza:       string;
    id_autore:           string;
    metodo_assegnazione: string;
    data_scadenza:       Date;
    sorgente:            string;
}

export async function findArticoliAssegnati(id_revisore: string): Promise<ArticoloAssegnato[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT a.id_articolo, a.titolo, a.stato, a.topic,
                a.media_voti, a.id_conferenza, a.id_autore,
                ea.metodo_assegnazione,
                c.data_fine_revisione AS data_scadenza,
                'Assegnazione' AS sorgente
         FROM e_assegnato ea
         JOIN articolo   a ON ea.id_articolo  = a.id_articolo
         JOIN conferenza c ON a.id_conferenza = c.id_conferenza
         WHERE ea.id_revisore = ?`,
        [id_revisore]
    );
    return rows as ArticoloAssegnato[];
}

export async function create(revisione: Revisione): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `INSERT INTO revisione
             (id_review, voto_competenza, valutazione, commento_chair, commento, stato_review, id_revisore, id_articolo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            revisione.id_review,
            revisione.voto_competenza,
            revisione.valutazione,
            revisione.commento_chair,
            revisione.commento,
            revisione.stato_review,
            revisione.id_revisore,
            revisione.id_articolo
        ]
    );
}

export async function isGiaRevisionato(
    id_articolo: string,
    id_revisore: string
): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM revisione
         WHERE id_articolo = ? AND id_revisore = ?`,
        [id_articolo, id_revisore]
    );
    return rows.length > 0;
}

export async function isGiaAssegnato(
    id_articolo: string,
    id_revisore: string
): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM e_assegnato
         WHERE id_articolo = ? AND id_revisore = ?`,
        [id_articolo, id_revisore]
    );
    return rows.length > 0;
}

export interface RevisionePerEditore {
    id_review:       string;
    valutazione:     number;
    voto_competenza: number;
    commento:        string;
}

export async function findByArticolo(id_articolo: string): Promise<RevisionePerEditore[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_review, valutazione, voto_competenza, commento
         FROM revisione
         WHERE id_articolo = ?`,
        [id_articolo]
    );
    return rows as RevisionePerEditore[];
}

export async function getValutazioniByArticolo(
    id_articolo: string
): Promise<{ valutazione: number; voto_competenza: number }[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT valutazione, voto_competenza
         FROM revisione
         WHERE id_articolo = ?`,
        [id_articolo]
    );
    return rows as { valutazione: number; voto_competenza: number }[];
}

// accesso consentito se assegnato direttamente all'articolo O membro PC della conferenza
export async function canAccessDocumento(
    id_articolo: string,
    id_revisore: string
): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM e_assegnato
         WHERE id_articolo = ? AND id_revisore = ?
         UNION
         SELECT 1 FROM articolo a
         JOIN membro_pc mp ON a.id_conferenza = mp.id_conferenza
         WHERE a.id_articolo = ? AND mp.id_revisore = ?
         LIMIT 1`,
        [id_articolo, id_revisore, id_articolo, id_revisore]
    );
    return rows.length > 0;
}

export async function assegnaRevisore(
    id_articolo: string,
    id_revisore: string
): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `INSERT INTO e_assegnato (id_articolo, id_revisore, metodo_assegnazione)
         VALUES (?, ?, 'MANUALE')`,
        [id_articolo, id_revisore]
    );
}
