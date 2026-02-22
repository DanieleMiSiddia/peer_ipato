import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

// ============================================================
// INTERFACCE
// ============================================================

export interface Articolo {
    id_articolo:   string;
    titolo:        string;
    stato:         'SOTTOMESSO' | 'IN_REVISIONE_F' | 'SOTTOMESSO_F' | 'ACCETTATO' | 'RIFIUTATO';
    topic:         string;
    documento:     Buffer;
    media_voti:    number;
    id_autore:     string;
    id_conferenza: string;
}

/**
 * Versione senza il campo documento (LONGBLOB) — usata per le liste.
 * Evita di trasferire file pesanti quando non servono.
 */
export type ArticoloSenzaDocumento = Omit<Articolo, 'documento'>;

// ============================================================
// METODI
// ============================================================

/**
 * Inserisce un nuovo articolo nel database.
 * L'id_articolo viene generato dal controller prima della chiamata.
 * stato è sempre 'SOTTOMESSO' (hardcoded), media_voti inizia a NULL.
 */
export async function create(articolo: Omit<Articolo, 'media_voti' | 'stato'>): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `INSERT INTO articolo
             (id_articolo, titolo, stato, topic, documento, id_autore, id_conferenza)
         VALUES (?, ?, 'SOTTOMESSO', ?, ?, ?, ?)`,
        [
            articolo.id_articolo,
            articolo.titolo,
            articolo.topic,
            articolo.documento,
            articolo.id_autore,
            articolo.id_conferenza
        ]
    );
}

/**
 * Imposta lo stato dell'articolo a 'ACCETTATO'.
 * Restituisce true se la riga è stata aggiornata, false se l'id non esiste.
 */
export async function updateStatoAccettato(id_articolo: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE articolo SET stato = 'ACCETTATO' WHERE id_articolo = ?",
        [id_articolo]
    );
    return result.affectedRows > 0;
}

/**
 * Elimina un articolo solo se appartiene all'autore specificato.
 * Restituisce true se la riga è stata eliminata, false se non esisteva
 * o se id_autore non corrisponde (ownership check in DB).
 */
export async function deleteById(id_articolo: string, id_autore: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM articolo WHERE id_articolo = ? AND id_autore = ?',
        [id_articolo, id_autore]
    );
    return result.affectedRows > 0;
}

/**
 * Restituisce solo il documento (LONGBLOB) di un articolo tramite il suo ID.
 * Usato quando l'utente vuole scaricare/visualizzare il file caricato.
 * Restituisce null se l'articolo non esiste.
 */
export async function getDocumentoById(id_articolo: string): Promise<Buffer | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT documento FROM articolo WHERE id_articolo = ?',
        [id_articolo]
    );
    return rows.length > 0 ? (rows[0].documento as Buffer) : null;
}

/**
 * Restituisce la lista di id_conferenza distinti in cui un autore
 * ha già sottomesso almeno un articolo.
 */
export async function findIdConferenzaByIdAutore(id_autore: string): Promise<string[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT DISTINCT id_conferenza
         FROM articolo
         WHERE id_autore = ?`,
        [id_autore]
    );
    return rows.map(r => r.id_conferenza as string);
}

/**
 * Restituisce tutti gli articoli sottomessi da un autore,
 * escludendo il campo documento (LONGBLOB) per leggerezza.
 */
export async function findByIdAutore(id_autore: string): Promise<ArticoloSenzaDocumento[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_articolo, titolo, stato, topic, media_voti, id_autore, id_conferenza
         FROM articolo
         WHERE id_autore = ?`,
        [id_autore]
    );
    return rows as ArticoloSenzaDocumento[];
}

/**
 * Restituisce tutti gli articoli sottomessi a una conferenza,
 * escludendo il campo documento (LONGBLOB) per leggerezza.
 */
export async function findByConferenza(id_conferenza: string): Promise<ArticoloSenzaDocumento[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_articolo, titolo, stato, topic, media_voti, id_autore, id_conferenza
         FROM articolo
         WHERE id_conferenza = ?`,
        [id_conferenza]
    );
    return rows as ArticoloSenzaDocumento[];
}
