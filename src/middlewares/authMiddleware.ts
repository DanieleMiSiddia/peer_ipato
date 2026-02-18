import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as UtenteModel from '../models/utente.model';

// Estendiamo il tipo Request di Express per includere i dati dell'utente autenticato
declare global {
    namespace Express {
        interface Request {
            user?: { id_utente: string; role: string };
        }
    }
}

export const verificaToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token mancante' });
        return;
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id_utente: string;
            role: string;
            iat: number;
        };

        // Controlliamo se il token è stato emesso prima dell'ultimo logout
        const utente = await UtenteModel.findById(decoded.id_utente);
        if (!utente) {
            res.status(401).json({ message: 'Utente non trovato' });
            return;
        }

        if (utente.ultimo_logout) {
            const logoutTimestamp = Math.floor(new Date(utente.ultimo_logout).getTime() / 1000);
            if (decoded.iat < logoutTimestamp) {
                res.status(401).json({ message: 'Sessione scaduta, effettua nuovamente il login' });
                return;
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token non valido o scaduto' });
    }
};
