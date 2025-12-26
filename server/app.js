import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// Imports Locais
import connectDB from './config/db.js';
import { requestLogger, errorHandler } from './middlewares/logger.js';

//Routers
import authRoutes from './routes/authRouter.js';





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
app.use('/auth', authRoutes)

// Error Handler 
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});