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
    sorgente:            string;
}

// ============================================================
// METODI
// ============================================================

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

/**
 * Verifica se un revisore ha già scritto una revisione per un determinato articolo.
 * Restituisce true se esiste già una riga in revisione, false altrimenti.
 */
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

/**
 * Verifica se un articolo è già assegnato a un determinato revisore.
 * Restituisce true se esiste già la relazione in e_assegnato, false altrimenti.
 */
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

/**
 * Restituisce id_review, valutazione, voto_competenza e commento
 * di tutte le revisioni associate a un articolo.
 * Usata per la visualizzazione delle revisioni da parte dell'editore.
 */
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

/**
 * Restituisce valutazione e voto_competenza di tutte le revisioni
 * associate a un articolo. Usato per il calcolo della media ponderata.
 */
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

/**
 * Verifica se un revisore è autorizzato a scaricare il documento di un articolo.
 * L'accesso è consentito se almeno una delle seguenti condizioni è vera:
 *   1. L'articolo è assegnato al revisore tramite e_assegnato
 *   2. Il revisore è membro PC della conferenza a cui appartiene l'articolo
 */
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

/**
 * Inserisce la relazione di assegnazione tra un revisore e un articolo.
 * Il metodo_assegnazione è sempre 'MANUALE' per le assegnazioni da parte del Membro PC.
 */
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
