import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

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

// senza LONGBLOB — usata per le query di lista
export type ArticoloSenzaDocumento = Omit<Articolo, 'documento'>;

// stato hardcoded a 'SOTTOMESSO', media_voti inizia a NULL
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

export async function updateMediaVoti(id_articolo: string, media: number): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'UPDATE articolo SET media_voti = ? WHERE id_articolo = ?',
        [media, id_articolo]
    );
}

// ownership check nella WHERE: restituisce true solo se l'articolo appartiene all'autore
export async function deleteById(id_articolo: string, id_autore: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM articolo WHERE id_articolo = ? AND id_autore = ?',
        [id_articolo, id_autore]
    );
    return result.affectedRows > 0;
}

export async function getDocumentoById(id_articolo: string): Promise<Buffer | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT documento FROM articolo WHERE id_articolo = ?',
        [id_articolo]
    );
    return rows.length > 0 ? (rows[0].documento as Buffer) : null;
}

export async function findIdConferenzaByIdAutore(id_autore: string): Promise<string[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT DISTINCT id_conferenza
         FROM articolo
         WHERE id_autore = ?`,
        [id_autore]
    );
    return rows.map(r => r.id_conferenza as string);
}

export async function findByIdAutore(id_autore: string): Promise<ArticoloSenzaDocumento[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_articolo, titolo, stato, topic, media_voti, id_autore, id_conferenza
         FROM articolo
         WHERE id_autore = ?`,
        [id_autore]
    );
    return rows as ArticoloSenzaDocumento[];
}

export async function findByConferenza(id_conferenza: string): Promise<ArticoloSenzaDocumento[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_articolo, titolo, stato, topic, media_voti, id_autore, id_conferenza
         FROM articolo
         WHERE id_conferenza = ?`,
        [id_conferenza]
    );
    return rows as ArticoloSenzaDocumento[];
}

export interface ArticoloPerEditore {
    id_articolo: string;
    titolo:      string;
    media_voti:  number;
}

// esclude il filtro sullo stato: è il controller che scarta gli articoli già pubblicati
export async function findByConferenzaPerEditore(id_conferenza: string): Promise<ArticoloPerEditore[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_articolo, titolo, media_voti
         FROM articolo
         WHERE id_conferenza = ?`,
        [id_conferenza]
    );
    return rows as ArticoloPerEditore[];
}
