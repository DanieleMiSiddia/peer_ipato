import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';

// mappa ruolo → URL dashboard
const DASHBOARD_MAP: Record<string, string> = {
    'chair':    '/pages/dashboard/DashboardChair.html',
    'autore':   '/pages/dashboard/DashboardAutore.html',
    'revisore': '/pages/dashboard/DashboardRevisore.html',
    'editore':  '/pages/dashboard/DashboardEditore.html'
};

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const role = await UtenteModel.findRoleById(id_utente);
        if (!role) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        const dashboardUrl = DASHBOARD_MAP[role];
        if (!dashboardUrl) {
            return res.status(403).json({ message: 'Ruolo non autorizzato' });
        }

        res.status(200).json({ dashboardUrl });

    } catch (error) {
        console.error('Errore routing dashboard:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

export const getHomePage = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        const utente = await UtenteModel.findById(id_utente);
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.status(200).json({ utente });

    } catch (error) {
        console.error('Errore recupero homepage:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
