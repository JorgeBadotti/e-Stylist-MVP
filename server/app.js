import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load env variables FIRST, before other imports
dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

console.log("caminho para .env", path.resolve(process.cwd(), '.env'))

import express from 'express';
import cors from 'cors';
import session from 'express-session'; // <--- IMPORTANTE

// Imports Locais
import connectDB from './config/db.js';
import { requestLogger, errorHandler } from './middlewares/logger.js';
import passport from 'passport';
await import('./config/passport.js');

// Routers
import authRoutes from './routes/authRouter.js';


connectDB();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração de Sessão (Obrigatório para Login persistente)
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_super_secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Use 'true' se estiver usando HTTPS em produção
        maxAge: 24 * 60 * 60 * 1000 // 1 dia
    }
}));

// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS (Atualizado para aceitar credenciais/cookies)
app.use(cors({
    origin: 'http://localhost:5173', // URL do Frontend (Vite)
    credentials: true // Permite envio de cookies de sessão
}));



app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(requestLogger);

// Rotas
app.use('/auth', authRoutes);

// SPA Fallback
app.get('*', (req, res) => { // Mudamos para '*' para pegar qualquer rota não API
    // Se for rota de API, não retorna HTML
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return res.status(404).send('Not found');
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});