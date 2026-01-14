import { GoogleGenerativeAI } from "@google/generative-ai";

// Declare a variável e exporte ela diretamente (se precisar acessá-la fora)
export let genAIClient = null;

// Adicione a palavra 'export' antes da função
export function initGemini() {
    const apiKey = process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
        console.error("ERRO: GOOGLE_GEMINI_KEY não definida no .env");
        return;
    }
    genAIClient = new GoogleGenerativeAI(apiKey);
    console.log("Gemini inicializado com sucesso");
}

// REMOVA a linha: export default { initGemini, genAIClient };