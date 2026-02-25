import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateId } from '../utils/generateId';

export const register = async (req: Request, res: Response) => {
    try {
        const { nome, cognome, email, password, role, competenza } = req.body;

        const utenteEsistente = await UtenteModel.findByEmail(email);
        if (utenteEsistente) {
            return res.status(400).json({ message: 'Questa email è già registrata.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const nuovoId = generateId(5);

        await UtenteModel.createWithSpecialization({
            id_utente: nuovoId,
            nome,
            cognome,
            email,
            password: passwordHash,
            role,
            competenza: competenza || null,
            ultimo_logout: null
        });

        res.status(201).json({ message: 'Registrazione completata con successo!' });

    } catch (error) {
        console.error('Errore registrazione:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const utente = await UtenteModel.findByEmail(email);
        if (!utente) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        const passwordValida = await bcrypt.compare(password, utente.password);
        if (!passwordValida) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        const token = jwt.sign(
            {
                id_utente: utente.id_utente,
                role: utente.role
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '2h' }
        );

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

export const logout = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // aggiorna ultimo_logout: invalida tutti i token emessi prima di questo momento
        await UtenteModel.logout(id_utente);

        res.json({ message: 'Logout effettuato con successo' });

    } catch (error) {
        console.error('Errore logout:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
