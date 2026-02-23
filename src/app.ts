import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import authRoutes from './routes/authRoutes';
import modRoutes from './routes/modRoutes';
import homePageRoutes from './routes/homePageRoutes';
import dashboardChairRoutes    from './routes/dashboardChairRoutes';
import dashboardRevisoreRoutes  from './routes/dashboardRevisoreRoutes';
import dashboardMembroPCRoutes  from './routes/dashboardMembroPCRoutes';
import dashboardAutoreRoutes    from './routes/dashboardAutoreRoutes';
import dashboardEditoreRoutes   from './routes/dashboardEditoreRoutes';
import articoloRoutes           from './routes/articoloRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globali
app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/utente', modRoutes);
app.use('/api/homepage', homePageRoutes);
app.use('/api/dashboard-chair',    dashboardChairRoutes);
app.use('/api/dashboard-revisore', dashboardRevisoreRoutes);
app.use('/api/dashboard-membro-pc', dashboardMembroPCRoutes);
app.use('/api/dashboard-autore',   dashboardAutoreRoutes);
app.use('/api/dashboard-editore',  dashboardEditoreRoutes);
app.use('/api/articolo',           articoloRoutes);

// Test connessione al database
async function testDatabaseConnection(): Promise<void> {
    try {
        const connection = await pool.getConnection();
        console.log('Connessione al database MySQL riuscita');
        connection.release();
    } catch (error) {
        console.error('Errore di connessione al database:', error);
        process.exit(1);
    }
}

// Avvio server
app.listen(PORT, async () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
    await testDatabaseConnection();
});

export default app;
