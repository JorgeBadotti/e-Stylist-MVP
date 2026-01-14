const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Variável para armazenar a instância do cliente (Singleton pattern simples)
let genAIClient = null;

/**
 * Inicializa o cliente Gemini.
 * Em Node.js, diferente do Flask, geralmente não anexamos ao objeto 'app',
 * mas sim exportamos a instância ou usamos injeção de dependência.
 */
function initGemini() {
    const apiKey = process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
        console.error("ERRO: GOOGLE_GEMINI_KEY não definida no .env");
        return;
    }
    genAIClient = new GoogleGenerativeAI(apiKey);
}

/**
 * Baixa o HTML de uma URL e usa o Gemini para criar uma notícia estruturada.
 * @param {string} url - O link da notícia original.
 * @param {boolean} debug - Se deve logar informações no console.
 * @returns {Promise<string>} - O JSON em formato string (ou objeto, se preferir fazer parse antes).
 */