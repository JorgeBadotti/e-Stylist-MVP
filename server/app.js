import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// Imports Locais
import connectDB from './config/db.js';
import { initGemini } from './services/gemini.js';
import { configCloudinary } from './services/cloudinary.js';
import { requestLogger, errorHandler } from './middlewares/logger.js';

//Routers
import authRoutes from './routes/authRouter.js';
import lojaRoutes from './routes/lojaRouter.js';

import guardaRoupaRoutes from './routes/guardaRoupaRouter.js'
import roupaRoutes from './routes/roupaRouter.js';
import usuarioRoutes from './routes/usuarioRouter.js';
import looksRoutes from './routes/looksRouter.js';


dotenv.config();
//Mongo Init
connectDB();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middlewares de terceiros
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.static(path.join(__dirname, '..', 'dist')));




// Middlewares Custom
app.use(requestLogger);

// Routers
app.use('/auth', authRoutes);
app.use('/api/lojas', lojaRoutes);


app.use('/api/guarda-roupas', guardaRoupaRoutes);
app.use('/api/roupas', roupaRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/looks', looksRoutes);

// Serve index.html for SPA routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Error Handler 
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});