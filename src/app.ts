import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pool from './config/database';
import authRoutes from './routes/authRoutes';
import modRoutes from './routes/modRoutes';
import homePageRoutes from './routes/homePageRoutes';
import dashboardChairRoutes from './routes/dashboardChairRoutes';
import dashboardAutoreRoutes from './routes/dashboardAutoreRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globali
app.use(cors());
app.use(express.json());

// File statici (frontend)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/utente', modRoutes);
app.use('/api/homepage', homePageRoutes);
app.use('/api/dashboard-chair', dashboardChairRoutes);
app.use('/api/dashboard-autore', dashboardAutoreRoutes);

// Route principale: serve la pagina di autenticazione
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'auth.html'));
});

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
