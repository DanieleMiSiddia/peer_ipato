import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';
import bcrypt from 'bcrypt';

// --- MODIFICA PASSWORD ---
export const changePassword = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;
        const { vecchia_password, nuova_password } = req.body;

        // 1. Recuperiamo l'hash della password attuale dal DB
        const hashAttuale = await UtenteModel.findPasswordById(id_utente);
        if (!hashAttuale) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // 2. Verifichiamo che la vecchia password sia corretta
        const passwordValida = await bcrypt.compare(vecchia_password, hashAttuale);
        if (!passwordValida) {
            return res.status(401).json({ message: 'Password attuale non corretta' });
        }

        // 3. Criptiamo la nuova password
        const nuovoHash = await bcrypt.hash(nuova_password, 10);

        // 4. Aggiorniamo nel database
        await UtenteModel.updatePassword(id_utente, nuovoHash);

        res.json({ message: 'Password aggiornata con successo' });

    } catch (error) {
        console.error('Errore cambio password:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// --- MODIFICA EMAIL ---
export const changeEmail = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;
        const { nuova_email } = req.body;

        // 1. Verifichiamo che la nuova email non sia già in uso
        const emailEsistente = await UtenteModel.findByEmail(nuova_email);
        if (emailEsistente) {
            return res.status(400).json({ message: 'Questa email è già in uso' });
        }

        // 2. Aggiorniamo nel database
        await UtenteModel.updateEmail(id_utente, nuova_email);

        res.json({ message: 'Email aggiornata con successo' });

    } catch (error) {
        console.error('Errore cambio email:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
