import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';
import bcrypt from 'bcrypt';

export const modificaPassword = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;
        const { vecchia_password, nuova_password } = req.body;

        const hashAttuale = await UtenteModel.findPasswordById(id_utente);
        if (!hashAttuale) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        const vecchiaValida = await bcrypt.compare(vecchia_password, hashAttuale);
        if (!vecchiaValida) {
            return res.status(401).json({ message: 'Password attuale non corretta' });
        }

        // impedisce di impostare la stessa password
        const uguale = await bcrypt.compare(nuova_password, hashAttuale);
        if (uguale) {
            return res.status(400).json({ message: 'La password scelta è uguale alla precedente' });
        }

        const nuovoHash = await bcrypt.hash(nuova_password, 10);
        await UtenteModel.updatePassword(id_utente, nuovoHash);

        res.status(200).json({ message: 'Password aggiornata con successo' });

    } catch (error) {
        console.error('Errore modifica password:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const changeEmail = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;
        const { nuova_email } = req.body;

        const emailAttuale = await UtenteModel.findEmailById(id_utente);
        if (!emailAttuale) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        if (nuova_email === emailAttuale) {
            return res.status(400).json({ message: 'Email uguale alla precedente' });
        }

        const emailEsistente = await UtenteModel.findByEmail(nuova_email);
        if (emailEsistente) {
            return res.status(409).json({ message: 'Email già in utilizzo' });
        }

        await UtenteModel.updateEmail(id_utente, nuova_email);

        res.status(200).json({ message: 'Email cambiata correttamente' });

    } catch (error) {
        console.error('Errore cambio email:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
