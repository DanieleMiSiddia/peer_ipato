import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';
import bcrypt from 'bcrypt';

// --- MODIFICA PASSWORD ---
export const modificaPassword = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;
        const { vecchia_password, nuova_password } = req.body;

        // 1. Recupera l'hash della password attuale dal DB
        const hashAttuale = await UtenteModel.findPasswordById(id_utente);
        if (!hashAttuale) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // 2. Verifica che la vecchia password inserita sia corretta
        const vecchiaValida = await bcrypt.compare(vecchia_password, hashAttuale);
        if (!vecchiaValida) {
            return res.status(401).json({ message: 'Password attuale non corretta' });
        }

        // 3. Verifica che la nuova password sia diversa da quella attuale
        const uguale = await bcrypt.compare(nuova_password, hashAttuale);
        if (uguale) {
            return res.status(400).json({ message: 'La password scelta è uguale alla precedente' });
        }

        // 4. Cifra la nuova password con bcrypt
        const nuovoHash = await bcrypt.hash(nuova_password, 10);

        // 5. Salva il nuovo hash nel database
        await UtenteModel.updatePassword(id_utente, nuovoHash);

        res.status(200).json({ message: 'Password aggiornata con successo' });

    } catch (error) {
        console.error('Errore modifica password:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// --- MODIFICA EMAIL ---
export const changeEmail = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;
        const { nuova_email } = req.body;

        // 1. Recupera l'email attuale dell'utente
        const emailAttuale = await UtenteModel.findEmailById(id_utente);
        if (!emailAttuale) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // 2. Verifica che la nuova email sia diversa da quella attuale
        if (nuova_email === emailAttuale) {
            return res.status(400).json({ message: 'Email uguale alla precedente' });
        }

        // 3. Verifica che la nuova email non sia già associata ad un altro account
        const emailEsistente = await UtenteModel.findByEmail(nuova_email);
        if (emailEsistente) {
            return res.status(409).json({ message: 'Email già in utilizzo' });
        }

        // 4. Aggiorna l'email nel database
        await UtenteModel.updateEmail(id_utente, nuova_email);

        res.status(200).json({ message: 'Email cambiata correttamente' });

    } catch (error) {
        console.error('Errore cambio email:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
