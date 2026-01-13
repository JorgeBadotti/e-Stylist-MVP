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
import { configCloudinary } from './utils/cloudinary.js';
import { requestLogger, errorHandler } from './middlewares/logger.js';
import passport from 'passport';
await import('./config/passport.js');


// Routers
import authRoutes from './routes/authRouter.js';
import guardaRoupaRoutes from './routes/guardaRoupaRouter.js'
import roupaRoutes from './routes/roupaRouter.js'


connectDB();
configCloudinary();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração de Sessão (Obrigatório para Login persistente)
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_super_secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // MUDANÇA IMPORTANTE:
        // Se estiver local, TEM que ser false. Se estiver em produção (HTTPS), true.
        // Vamos forçar false se não tiver certeza que o ambiente é 'production'.
        secure: process.env.NODE_ENV === 'production',

        httpOnly: true, // Protege contra XSS
        maxAge: 24 * 60 * 60 * 1000,

        // Adicione isso! Ajuda o cookie a sobreviver ao redirect do Google
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));



// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS (Atualizado para aceitar credenciais/cookies)
app.use(cors({
    origin: 'http://localhost:5173', // TEM que bater exato com a URL do navegador (sem barra no final)
    credentials: true, // Permite cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));


app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(requestLogger);

// Rotas
app.use('/auth', authRoutes);
app.use('/api/guarda-roupas', guardaRoupaRoutes);
app.use('/api/roupas', roupaRoutes);

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