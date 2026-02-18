import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateId } from '../utils/generateId';

// --- REGISTRAZIONE UTENTE ---
export const register = async (req: Request, res: Response) => {
    try {
        // 1. Recuperiamo i dati dal corpo della richiesta
        const { nome, cognome, email, password, role, competenza } = req.body;

        // 2. Controllo Preliminare: L'email esiste già?
        const utenteEsistente = await UtenteModel.findByEmail(email);
        if (utenteEsistente) {
            return res.status(400).json({ message: 'Questa email è già registrata.' });
        }

        // 3. Sicurezza: Criptiamo la password (Hashing)
        // Il numero '10' è il "salt rounds" (costo di elaborazione), più è alto più è sicuro ma lento.
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Generiamo l'ID univoco (5 caratteri, compatibile con CHAR(5))
        const nuovoId = generateId(5);

        // 5. Salviamo nel Database usando il Model (utente + tabella di specializzazione)
        await UtenteModel.createWithSpecialization({
            id_utente: nuovoId,
            nome,
            cognome,
            email,
            password: passwordHash, // IMPORTANTE: Salviamo l'hash, mai la password in chiaro!
            role,
            competenza: competenza || null, // Se non c'è, mettiamo null
            ultimo_logout: null
        });

        // 6. Rispondiamo al Frontend
        res.status(201).json({ message: 'Registrazione completata con successo!' });

    } catch (error) {
        console.error('Errore registrazione:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// --- LOGIN UTENTE ---
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Cerchiamo l'utente nel DB tramite email
        const utente = await UtenteModel.findByEmail(email);

        // Se l'utente non esiste...
        if (!utente) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // 2. Verifichiamo la password
        // bcrypt confronta la password scritta dall'utente con l'hash nel DB
        const passwordValida = await bcrypt.compare(password, utente.password);

        // Se la password è sbagliata...
        if (!passwordValida) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // 3. Generiamo il Token (JWT)
        // Questo è il "Pass" che l'utente userà per fare modifiche dopo il login
        const token = jwt.sign(
            { 
                id_utente: utente.id_utente, 
                role: utente.role 
            }, 
            process.env.JWT_SECRET as string, // La chiave segreta nel file .env
            { expiresIn: '2h' } // Il token scade dopo 2 ore
        );

        // 4. Rispondiamo con il Token e i dati utente (senza password)
        res.json({
            message: 'Login effettuato',
            token: token,
            user: {
                id: utente.id_utente,
                nome: utente.nome,
                role: utente.role
            }
        });

    } catch (error) {
        console.error('Errore login:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// --- LOGOUT UTENTE ---
export const logout = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // Registriamo il timestamp di logout nel DB
        // Da questo momento, tutti i token emessi prima di NOW() sono invalidati
        await UtenteModel.logout(id_utente);

        res.json({ message: 'Logout effettuato con successo' });

    } catch (error) {
        console.error('Errore logout:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};