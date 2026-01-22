import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import passport from 'passport';

// Importa a configuração do Passport (isso executa o código de configuração)
import './config/passport.js';


// Imports Locais
import connectDB from './config/db.js';
import { initGemini } from './services/gemini.js';
import { configCloudinary } from './services/cloudinary.js';
import { requestLogger, errorHandler } from './middlewares/logger.js';

//Routers
import authRoutes from './routes/authRouter.js';
import lojaRoutes from './routes/lojaRouter.js';
import conviteRoutes from './routes/conviteRouter.js'; // ✅ NOVO: Rota de convites
import analyticsRoutes from './routes/analyticsRouter.js'; // ✅ NOVO: Rota de analytics (CDP)

import guardaRoupaRoutes from './routes/guardaRoupaRouter.js'
import produtoRoutes from './routes/produtoRouter.js';
import usuarioRoutes from './routes/usuarioRouter.js';
import looksRoutes from './routes/looksRouter.js';


dotenv.config();
//Mongo Init
connectDB();
initGemini();
configCloudinary();

const app = express();
app.set('trust proxy', 1);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middlewares de terceiros
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));

// --- CONFIGURAÇÃO DE SESSÃO E PASSPORT ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Em produção, use true com HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 dia
    }
}));

// Inicializa o Passport
app.use(passport.initialize());
// Habilita sessões persistentes de login
app.use(passport.session());
// -----------------------------------------


// Middlewares Custom
app.use(requestLogger);

// ⭐ ROTAS DA API DEVEM VIR ANTES DOS ARQUIVOS ESTÁTICOS
// Routers
app.use('/auth', authRoutes);
app.use('/api/lojas', lojaRoutes);
app.use('/api/guarda-roupas', guardaRoupaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/looks', looksRoutes);
app.use('/api/convites', conviteRoutes);
app.use('/api/analytics', analyticsRoutes);

// ⭐ ARQUIVOS ESTÁTICOS E SPA ROUTING DEPOIS DAS APIS
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Serve index.html for SPA routing (fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Error Handler 
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});