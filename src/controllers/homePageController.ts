import { Request, Response } from 'express';
import * as UtenteModel from '../models/utente.model';

// Mappa ruolo → URL della dashboard corrispondente
const DASHBOARD_MAP: Record<string, string> = {
    'chair':    '/pages/dashboard/DashboardChair.html',
    'autore':   '/pages/dashboard/DashboardAutore.html',
    'revisore': '/pages/dashboard/DashboardRevisore.html',
    'editore':  '/pages/dashboard/DashboardEditore.html'
};

// --- DASHBOARD ROUTING ---
export const getDashboard = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // 1. Recuperiamo il ruolo aggiornato dal DB tramite il Model
        const role = await UtenteModel.findRoleById(id_utente);
        if (!role) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // 2. Determiniamo l'URL della dashboard in base al ruolo
        const dashboardUrl = DASHBOARD_MAP[role];
        if (!dashboardUrl) {
            return res.status(403).json({ message: 'Ruolo non autorizzato' });
        }

        // 3. Restituiamo l'URL al frontend
        res.status(200).json({ dashboardUrl });

    } catch (error) {
        console.error('Errore routing dashboard:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};

// --- HOMEPAGE UTENTE ---
export const getHomePage = async (req: Request, res: Response) => {
    try {
        const id_utente = req.user!.id_utente;

        // 1. Recuperiamo il profilo completo dell'utente autenticato (senza password)
        const utente = await UtenteModel.findById(id_utente);
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // 2. Restituiamo i dati al frontend per il rendering della homepage
        res.status(200).json({ utente });

    } catch (error) {
        console.error('Errore recupero homepage:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
