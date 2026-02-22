import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

// ============================================================
// INTERFACCE
// ============================================================

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
    sorgente:            'Assegnazione' | 'Offerta';
}

// ============================================================
// METODI
// ============================================================

/**
 * Restituisce tutte le revisioni scritte da un revisore,
 * arricchite con il titolo dell'articolo revisionato.
 */
export async function findRevisioniByRevisore(
    id_revisore: string
): Promise<(Revisione & { titolo_articolo: string })[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT r.*, a.titolo AS titolo_articolo
         FROM revisione r
         JOIN articolo a ON r.id_articolo = a.id_articolo
         WHERE r.id_revisore = ?`,
        [id_revisore]
    );
    return rows as (Revisione & { titolo_articolo: string })[];
}

/**
 * Restituisce una singola revisione tramite il suo ID.
 */
export async function findById(id_review: string): Promise<Revisione | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM revisione WHERE id_review = ?',
        [id_review]
    );
    return rows.length > 0 ? (rows[0] as Revisione) : null;
}

/**
 * Restituisce tutti gli articoli assegnati a un revisore tramite e_assegnato.
 * Data scadenza = data_fine_revisione della conferenza.
 * Esclude il campo documento (LONGBLOB) per leggerezza.
 */
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

/**
 * Restituisce tutti gli articoli offerti al revisore tramite bidding (tabella offerta).
 * Data scadenza = data_scadenza dell'offerta stessa.
 */
export async function findArticoliDaOfferta(id_revisore: string): Promise<ArticoloAssegnato[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT a.id_articolo, a.titolo, a.stato, a.topic,
                a.media_voti, a.id_conferenza, a.id_autore,
                'BIDDING' AS metodo_assegnazione,
                o.data_scadenza,
                'Offerta' AS sorgente
         FROM offerta o
         JOIN articolo a ON o.id_articolo = a.id_articolo
         WHERE o.id_revisore = ?`,
        [id_revisore]
    );
    return rows as ArticoloAssegnato[];
}

/**
 * Inserisce una nuova revisione nel database.
 * L'id_review viene generato dal controller prima della chiamata.
 */
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
