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
