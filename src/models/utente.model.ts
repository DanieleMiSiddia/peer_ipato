import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';

// interfaccia completa — usata internamente per login e scrittura DB
export interface Utente {
    id_utente: string;
    nome: string;
    cognome: string;
    email: string;
    password: string;
    role: 'autore' | 'revisore' | 'chair' | 'editore';
    competenza: string | null;
    ultimo_logout: Date | null;
}

// senza password — usata per risposte API e sessione
export type UtenteSicuro = Omit<Utente, 'password'>;

export async function findByEmail(email: string): Promise<Utente | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM utente WHERE email = ?',
        [email]
    );
    return rows.length > 0 ? (rows[0] as Utente) : null;
}

export async function findById(id_utente: string): Promise<UtenteSicuro | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_utente, nome, cognome, email, role, competenza, ultimo_logout
         FROM utente WHERE id_utente = ?`,
        [id_utente]
    );
    return rows.length > 0 ? (rows[0] as UtenteSicuro) : null;
}

export async function create(utente: Utente): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `INSERT INTO utente (id_utente, nome, cognome, email, password, role, competenza)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [utente.id_utente, utente.nome, utente.cognome, utente.email,
         utente.password, utente.role, utente.competenza]
    );
}

const VALID_ROLES = ['autore', 'revisore', 'chair', 'editore'] as const;

// inserisce utente e tabella di specializzazione in un'unica transazione atomica
export async function createWithSpecialization(utente: Utente): Promise<void> {
    if (!(VALID_ROLES as readonly string[]).includes(utente.role)) {
        throw new Error(`Ruolo non valido: ${utente.role}`);
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute<ResultSetHeader>(
            `INSERT INTO utente (id_utente, nome, cognome, email, password, role, competenza)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [utente.id_utente, utente.nome, utente.cognome, utente.email,
             utente.password, utente.role, utente.competenza]
        );

        await connection.execute<ResultSetHeader>(
            `INSERT INTO ${utente.role} (id_utente) VALUES (?)`,
            [utente.id_utente]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function findRoleById(id_utente: string): Promise<string | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT role FROM utente WHERE id_utente = ?',
        [id_utente]
    );
    return rows.length > 0 ? (rows[0].role as string) : null;
}

export async function findRoleByEmail(email: string): Promise<{ id_utente: string; role: string } | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id_utente, role FROM utente WHERE email = ?',
        [email]
    );
    return rows.length > 0 ? (rows[0] as { id_utente: string; role: string }) : null;
}

export async function findPasswordById(id_utente: string): Promise<string | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT password FROM utente WHERE id_utente = ?',
        [id_utente]
    );
    return rows.length > 0 ? (rows[0].password as string) : null;
}

export async function findEmailById(id_utente: string): Promise<string | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT email FROM utente WHERE id_utente = ?',
        [id_utente]
    );
    return rows.length > 0 ? (rows[0].email as string) : null;
}

export async function updatePassword(id_utente: string, password: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'UPDATE utente SET password = ? WHERE id_utente = ?',
        [password, id_utente]
    );
}

export async function updateEmail(id_utente: string, email: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'UPDATE utente SET email = ? WHERE id_utente = ?',
        [email, id_utente]
    );
}

export async function logout(id_utente: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'UPDATE utente SET ultimo_logout = NOW() WHERE id_utente = ?',
        [id_utente]
    );
}

// cerca revisore per email — restituisce id, nome, cognome o null
export async function findRevisoreByEmail(
    email: string
): Promise<{ id_utente: string; nome: string; cognome: string } | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id_utente, nome, cognome
         FROM utente
         WHERE email = ? AND role = 'revisore'`,
        [email]
    );
    return rows.length > 0
        ? (rows[0] as { id_utente: string; nome: string; cognome: string })
        : null;
}
