import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS for frontend communication
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));

// Parse JSON and URL-encoded request bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the Vite build output (after npm run build)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// ============================================================================
// LOGGING & ERROR HANDLING MIDDLEWARE
// ============================================================================

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// API ROUTES
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'e-Stylist MVP backend is running',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/config', (req, res) => {
    res.json({
        apiKeyAvailable: !!API_KEY,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});

app.post('/api/looks/generate', async (req, res) => {
    try {
        const input = req.body;

        if (!input.profile || !input.wardrobe || !input.occasion) {
            return res.status(400).json({ error: 'Invalid input: profile, wardrobe, and occasion are required' });
        }

        if (!API_KEY) {
            return res.status(503).json({ error: 'API Key not configured. Please set VITE_GEMINI_API_KEY.' });
        }

        const genai = await import('@google/genai');
        const { GoogleGenAI } = genai.GoogleGenAI ? genai : genai.default ? genai.default : genai;
        const client = new GoogleGenAI({ apiKey: API_KEY });

        const systemInstruction = `\nVocê é o e-Stylist MVP, um assistente de styling pessoal inteligente.\n\nSua missão é criar looks coerentes, explicáveis e acessíveis, usando exclusivamente os dados fornecidos no input.\n\nGere exatamente 3 looks explicando por que funcionam, alertando conflitos quando existirem.\n`;

        const result = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nInput:\n${JSON.stringify(input, null, 2)}` }] }],
            systemInstruction,
        });

        const responseText = result.response?.text?.();
        if (!responseText) return res.status(500).json({ error: 'No response from AI model' });

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ error: 'Failed to extract JSON from AI response', rawResponse: responseText });

        const output = JSON.parse(jsonMatch[0]);
        if (!output.looks || !Array.isArray(output.looks) || output.looks.length !== 3) {
            return res.status(500).json({ error: 'Invalid AI response: expected exactly 3 looks', output });
        }

        res.json(output);
    } catch (error) {
        console.error('Error generating looks:', error);
        res.status(500).json({ error: 'Failed to generate looks', message: error.message });
    }
});

const sharedLooks = new Map();

app.post('/api/shared-looks', (req, res) => {
    try {
        const { look, profile, occasion } = req.body;
        if (!look || !profile) return res.status(400).json({ error: 'Missing look or profile data' });
        const lookId = `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const sharedData = { lookId, look, profile, occasion, createdAt: new Date().toISOString() };
        sharedLooks.set(lookId, sharedData);
        res.json({ lookId, shareUrl: `${process.env.SHARE_BASE_URL || 'http://localhost:3000'}/shared/${lookId}` });
    } catch (error) {
        console.error('Error creating shared look:', error);
        res.status(500).json({ error: 'Failed to create shared look', message: error.message });
    }
});

app.get('/api/shared-looks/:lookId', (req, res) => {
    try {
        const { lookId } = req.params;
        const sharedData = sharedLooks.get(lookId);
        if (!sharedData) return res.status(404).json({ error: 'Shared look not found' });
        res.json(sharedData);
    } catch (error) {
        console.error('Error retrieving shared look:', error);
        res.status(500).json({ error: 'Failed to retrieve shared look', message: error.message });
    }
});

app.get('/api/profiles', (req, res) => res.json({ message: 'Profile management endpoint', placeholder: true }));

app.post('/api/profiles', (req, res) => {
    try {
        const profile = req.body;
        if (!profile.name || !profile.style_preferences) return res.status(400).json({ error: 'Profile must include name and style_preferences' });
        console.log(`Profile created/updated: ${profile.name}`);
        res.json({ message: 'Profile saved successfully', profile });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ error: 'Failed to save profile', message: error.message });
    }
});

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
        return;
    }
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (!API_KEY) console.warn('VITE_GEMINI_API_KEY is not set. AI features unavailable.');
});

export default app;
