import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface Revisione {
    id_review: string;
    voto_competenza: number;
    valutazione: number;
    commento: string;
    id_revisore: string;
    nome_revisore: string;
    cognome_revisore: string;
}

/**
 * Recupera tutte le revisioni associate a un articolo specifico,
 * includendo il nome e cognome del revisore.
 */
export async function findByArticolo(id_articolo: string): Promise<Revisione[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
            r.id_review, 
            r.voto_competenza, 
            r.valutazione, 
            r.commento,
            r.id_revisore,
            u.nome as nome_revisore,
            u.cognome as cognome_revisore
         FROM revisione r
         JOIN utente u ON r.id_revisore = u.id_utente
         WHERE r.id_articolo = ?`,
        [id_articolo]
    );
    return rows as Revisione[];
}
