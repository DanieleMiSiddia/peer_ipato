import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

export async function isPubblicato(id_articolo: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT 1 FROM pubblicazione WHERE id_articolo = ? LIMIT 1',
        [id_articolo]
    );
    return rows.length > 0;
}

// conta le pubblicazioni già presenti per la conferenza dell'articolo — usato per il controllo limite
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

// accesso consentito se l'articolo appartiene a una conferenza di cui l'utente è editore
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
