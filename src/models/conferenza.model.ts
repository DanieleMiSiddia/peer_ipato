import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

// ============================================================
// INTERFACCIA: mappa 1:1 tutte le colonne della tabella conferenza
// ============================================================
export interface Conferenza {
    id_conferenza:           string;
    data_inizio_conferenza:  Date;
    data_fine_conferenza:    Date;
    data_inizio_revisione:   Date;
    data_fine_revisione:     Date;
    data_inizio_sottomissione: Date;
    data_fine_sottomissione:   Date;
    numero_articoli:         number;
    nome:                    string;
    topic:                   string;
    id_chair:                string;
    id_editore:              string;
}

// ============================================================
// METODI
// ============================================================

/**
 * Inserisce una nuova conferenza nel database.
 * L'id_conferenza viene generato dal controller prima della chiamata.
 */
export async function create(conferenza: Conferenza): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `INSERT INTO conferenza (
            id_conferenza,
            data_inizio_conferenza, data_fine_conferenza,
            data_inizio_revisione,  data_fine_revisione,
            data_inizio_sottomissione, data_fine_sottomissione,
            numero_articoli,
            nome,
            topic,
            id_chair,
            id_editore
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            conferenza.id_conferenza,
            conferenza.data_inizio_conferenza,
            conferenza.data_fine_conferenza,
            conferenza.data_inizio_revisione,
            conferenza.data_fine_revisione,
            conferenza.data_inizio_sottomissione,
            conferenza.data_fine_sottomissione,
            conferenza.numero_articoli,
            conferenza.nome,
            conferenza.topic,
            conferenza.id_chair,
            conferenza.id_editore
        ]
    );
}

/**
 * Inserisce una relazione co-chair tra una conferenza e un chair.
 */
export async function addCoChair(id_conferenza: string, id_chair: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'INSERT INTO co_chair (id_conferenza, id_chair) VALUES (?, ?)',
        [id_conferenza, id_chair]
    );
}

/**
 * Aggiunge un revisore come membro PC di una conferenza.
 * Inserisce la relazione diretta nella tabella membro_pc (id_conferenza, id_revisore).
 */
export async function addMembroPC(id_conferenza: string, id_revisore: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'INSERT INTO membro_pc (id_conferenza, id_revisore) VALUES (?, ?)',
        [id_conferenza, id_revisore]
    );
}

/**
 * Restituisce i dati completi di una singola conferenza,
 * solo se l'utente è chair principale o co-chair di essa.
 * Restituisce null se la conferenza non esiste o l'utente non è autorizzato.
 */
export async function findByIdForChair(id_conferenza: string, id_utente: string): Promise<Conferenza | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT DISTINCT c.*
         FROM conferenza c
         LEFT JOIN co_chair cc ON c.id_conferenza = cc.id_conferenza
         WHERE c.id_conferenza = ? AND (c.id_chair = ? OR cc.id_chair = ?)`,
        [id_conferenza, id_utente, id_utente]
    );
    return rows.length > 0 ? (rows[0] as Conferenza) : null;
}

/**
 * Restituisce tutte le conferenze in cui il revisore è membro PC
 * (tabella membro_pc).
 */
export async function findConferenzeByMembroPC(id_revisore: string): Promise<Conferenza[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT
            c.id_conferenza,
            c.data_inizio_conferenza,
            c.data_fine_conferenza,
            c.data_inizio_revisione,
            c.data_fine_revisione,
            c.data_inizio_sottomissione,
            c.data_fine_sottomissione,
            c.numero_articoli,
            c.nome,
            c.topic,
            c.id_chair,
            c.id_editore
         FROM membro_pc mp
         JOIN conferenza c ON mp.id_conferenza = c.id_conferenza
         WHERE mp.id_revisore = ?`,
        [id_revisore]
    );
    return rows as Conferenza[];
}

/**
 * Restituisce tutte le conferenze presenti nel database.
 * Il filtro per fase (sottomissione, revisione, ecc.) viene
 * applicato a livello di controller.
 */
export async function findConferenze(): Promise<Conferenza[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT
            id_conferenza,
            data_inizio_conferenza,
            data_fine_conferenza,
            data_inizio_revisione,
            data_fine_revisione,
            data_inizio_sottomissione,
            data_fine_sottomissione,
            numero_articoli,
            nome,
            topic,
            id_chair,
            id_editore
         FROM conferenza`
    );
    return rows as Conferenza[];
}

/**
 * Restituisce tutte le conferenze di cui l'utente è chair principale
 * (conferenza.id_chair) oppure co-chair (tabella co_chair).
 * DISTINCT evita duplicati nel caso (improbabile) in cui un utente
 * compaia in entrambe le relazioni per la stessa conferenza.
 */
export async function findConferenzeByChair(id_utente: string): Promise<Conferenza[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT DISTINCT
            c.id_conferenza,
            c.data_inizio_conferenza,
            c.data_fine_conferenza,
            c.data_inizio_revisione,
            c.data_fine_revisione,
            c.data_inizio_sottomissione,
            c.data_fine_sottomissione,
            c.numero_articoli,
            c.nome,
            c.topic,
            c.id_chair,
            c.id_editore
         FROM conferenza c
         LEFT JOIN co_chair cc ON c.id_conferenza = cc.id_conferenza
         WHERE c.id_chair = ? OR cc.id_chair = ?`,
        [id_utente, id_utente]
    );
    return rows as Conferenza[];
}

/**
 * Restituisce tutte le conferenze di cui l'utente è editore.
 * Usata dalla Dashboard Editore per popolare la lista delle conferenze gestite.
 */
export async function findConferenzeByEditore(id_editore: string): Promise<Conferenza[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT
            id_conferenza,
            data_inizio_conferenza,
            data_fine_conferenza,
            data_inizio_revisione,
            data_fine_revisione,
            data_inizio_sottomissione,
            data_fine_sottomissione,
            numero_articoli,
            nome,
            topic,
            id_chair,
            id_editore
         FROM conferenza
         WHERE id_editore = ?`,
        [id_editore]
    );
    return rows as Conferenza[];
}

/**
 * Restituisce il numero massimo di articoli pubblicabili per la conferenza
 * a cui appartiene l'articolo dato. Usato dal controller di pubblicazione
 * per verificare se il limite è già stato raggiunto.
 */
export async function getLimiteByArticolo(id_articolo: string): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT c.numero_articoli
         FROM articolo a
         JOIN conferenza c ON a.id_conferenza = c.id_conferenza
         WHERE a.id_articolo = ?`,
        [id_articolo]
    );
    return rows.length > 0 ? (rows[0].numero_articoli as number) : 0;
}

/**
 * Verifica se un revisore è già membro PC di una conferenza.
 * Restituisce true se esiste la relazione in membro_pc, false altrimenti.
 */
export async function isMembroPC(
    id_conferenza: string,
    id_revisore: string
): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM membro_pc
         WHERE id_conferenza = ? AND id_revisore = ?`,
        [id_conferenza, id_revisore]
    );
    return rows.length > 0;
}
