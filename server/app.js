import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Calcula o caminho correto para o .env na raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

// Carrega variáveis de ambiente PRIMEIRO, antes de qualquer outra importação
dotenv.config({ path: envPath });


import express from 'express';
import cors from 'cors';
import passport from './config/passport.js';

// Imports Locais
import connectDB from './config/db.js';
import configureSession from './config/session.js';
import { initGemini } from './services/gemini.js';
import { configCloudinary } from './services/cloudinary.js';
import { initPassport } from './config/passport.js';
import { requestLogger, errorHandler } from './middlewares/logger.js';
import anonymousSessionMiddleware from './middlewares/anonymousSessionMiddleware.js';

//Routers
import authRoutes from './routes/authRouter.js';
import lojaRoutes from './routes/lojaRouter.js';
import conviteRoutes from './routes/conviteRouter.js'; // ✅ NOVO: Rota de convites

import guardaRoupaRoutes from './routes/guardaRoupaRouter.js'
import produtoRoutes from './routes/produtoRouter.js';
import usuarioRoutes from './routes/usuarioRouter.js';
import looksRoutes from './routes/looksRouter.js';
import carrinhoRoutes from './routes/carrinhoRouter.js'; // ✅ NOVO: Rota de carrinho

// Mongo Init
connectDB();
initGemini();
configCloudinary();
initPassport(); // ✅ Agora inicializa APÓS o banco estar pronto

const app = express();
app.set('trust proxy', 1);

// Middlewares de terceiros
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));

// --- CONFIGURAÇÃO DE SESSÃO E PASSPORT ---
app.use(configureSession());

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
app.use('/api/carrinhos', carrinhoRoutes); // ✅ NOVO: Rota de carrinho

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