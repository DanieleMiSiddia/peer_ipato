import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface Articolo {
    id_articolo: string;
    titolo: string;
    stato: string;
    topic: string;
    data_decisione: Date | null;
    documento: Buffer | null;
    id_autore: string;
    media_voti: number;
    id_conferenza: string;
}

export interface ArticoloDashboardItem {
    id_articolo: string;
    titolo: string;
    nome_conferenza: string;
    stato: string;
}

/**
 * Recupera tutti gli articoli sottomessi da un autore specifico,
 * includendo il nome della conferenza associata.
 */
export async function findByAutore(id_autore: string): Promise<ArticoloDashboardItem[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
            a.id_articolo, 
            a.titolo, 
            c.nome as nome_conferenza, 
            a.stato
         FROM articolo a
         JOIN conferenza c ON a.id_conferenza = c.id_conferenza
         WHERE a.id_autore = ?
         ORDER BY a.id_articolo DESC`,
        [id_autore]
    );
    return rows as ArticoloDashboardItem[];
}
export async function findArticoliGestionePubblicazioni(id_editore: string): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
            a.id_articolo, 
            a.titolo, 
            a.media_voti,
            c.nome as nome_conferenza
         FROM articolo a
         JOIN conferenza c ON a.id_conferenza = c.id_conferenza
         WHERE c.id_editore = ? AND a.stato = 'SOTTOMESSO_F'
         ORDER BY a.media_voti DESC`,
        [id_editore]
    );
    return rows;
}

/**
 * Recupera i dettagli di un singolo articolo per la pagina di pubblicazione.
 */
export async function findById(id_articolo: string): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT a.id_articolo, a.titolo, c.nome as nome_conferenza
         FROM articolo a
         JOIN conferenza c ON a.id_conferenza = c.id_conferenza
         WHERE a.id_articolo = ?`,
        [id_articolo]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Finalizza la pubblicazione di un articolo:
 * 1. Cambia lo stato dell'articolo in 'ACCETTATO' (o uno stato finale)
 * 2. Inserisce il record nella tabella pubblicazione
 */
export async function pubblica(id_articolo: string, id_editore: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Aggiorna stato articolo
        await connection.execute(
            "UPDATE articolo SET stato = 'ACCETTATO' WHERE id_articolo = ?",
            [id_articolo]
        );

        // 2. Inserisce record pubblicazione
        const codice_pubb = 'PUB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        await connection.execute(
            "INSERT INTO pubblicazione (codice_pubblicazione, id_articolo, id_editore) VALUES (?, ?, ?)",
            [codice_pubb, id_articolo, id_editore]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
