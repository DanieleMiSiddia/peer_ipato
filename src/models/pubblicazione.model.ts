import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

// ============================================================
// METODI
// ============================================================

/**
 * Verifica se un articolo è già presente nella tabella pubblicazione.
 * Restituisce true se esiste almeno una riga con quell'id_articolo.
 */
export async function isPubblicato(id_articolo: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT 1 FROM pubblicazione WHERE id_articolo = ? LIMIT 1',
        [id_articolo]
    );
    return rows.length > 0;
}

/**
 * Conta quante pubblicazioni esistono già per la conferenza
 * a cui appartiene l'articolo dato. Usato per confrontare con il limite.
 */
export async function countByConferenza(id_articolo: string): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS totale
         FROM pubblicazione p
         JOIN articolo a ON p.id_articolo = a.id_articolo
         WHERE a.id_conferenza = (
             SELECT id_conferenza FROM articolo WHERE id_articolo = ?
         )`,
        [id_articolo]
    );
    return rows.length > 0 ? (rows[0].totale as number) : 0;
}

/**
 * Inserisce una nuova riga nella tabella pubblicazione.
 * codice_pubblicazione è generato dal controller con generateId(10).
 */
export async function create(
    codice_pubblicazione: string,
    id_articolo:          string,
    id_editore:           string
): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `INSERT INTO pubblicazione (codice_pubblicazione, id_articolo, id_editore)
         VALUES (?, ?, ?)`,
        [codice_pubblicazione, id_articolo, id_editore]
    );
}

/**
 * Restituisce tutti gli articoli pubblicati di una conferenza,
 * con id, titolo e media voti. Usata dalla pagina Chair per
 * consultare gli atti della conferenza.
 */
export interface ArticoloPubblicato {
    id_articolo: string;
    titolo:      string;
    media_voti:  number;
}

export async function findPubblicatiByConferenza(id_conferenza: string): Promise<ArticoloPubblicato[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT a.id_articolo, a.titolo, a.media_voti
         FROM pubblicazione p
         JOIN articolo a ON p.id_articolo = a.id_articolo
         WHERE a.id_conferenza = ?`,
        [id_conferenza]
    );
    return rows as ArticoloPubblicato[];
}

/**
 * Verifica se l'editore è autorizzato ad accedere al documento di un articolo.
 * L'accesso è consentito se l'articolo appartiene a una conferenza
 * di cui l'utente è l'editore assegnato (conferenza.id_editore).
 */
export async function canEditoreAccessDocumento(
    id_articolo: string,
    id_editore:  string
): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1
         FROM articolo a
         JOIN conferenza c ON a.id_conferenza = c.id_conferenza
         WHERE a.id_articolo = ?
           AND c.id_editore  = ?
         LIMIT 1`,
        [id_articolo, id_editore]
    );
    return rows.length > 0;
}
