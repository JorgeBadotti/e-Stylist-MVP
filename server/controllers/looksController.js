import Usuario from '../models/UsuarioModel.js';
import GuardaRoupa from '../models/GuardaRoupa.js';
import Roupa from '../models/Roupa.js';
import Look from '../models/LookModel.js';
import { genAIClient } from '../services/gemini.js';
import { v4 as uuidv4 } from 'uuid';

export const gerarLooks = async (req, res) => {
    console.log("Dentro de Gerar Looks")
    try {
        const { wardrobeId, prompt: userOccasion } = req.body;
        const userId = req.user._id;

        // 1. Buscar Perfil do Usuário
        const usuario = await Usuario.findById(userId);
        if (!usuario || !usuario.medidas) {
            return res.status(400).json({ error: "Perfil incompleto. Necessário medidas e foto." });
        }

        // 2. Buscar Roupas do Guarda-Roupa Selecionado
        console.log("Buscando roupas para o guarda-roupa:", wardrobeId);
        const roupas = await Roupa.find({ guardaRoupa: wardrobeId });
        console.log("Roupas encontradas:", roupas.length);
        if (roupas.length < 2) {
            return res.status(400).json({ error: "Guarda-roupa precisa ter pelo menos 2 peças para gerar looks." });
        }

        // 3. Preparar Dados para o Gemini (Mapeando para o formato que definimos nos prompts)
        const itemsForAI = roupas.map(r => ({
            id: r._id,
            name: r.nome || r.descricao, // Fallback se nome estiver vazio
            source: 'closet'
        }));

        // 4. Montar o Prompt (Usando a lógica do arquivo generate_looks.md que discutimos)
        const systemInstruction = `
            Role: Você é o StyleMe AI Engine.
            Contexto do Usuário:
            - Nome: ${usuario.nome}
            - Medidas: Busto ${usuario.medidas.busto}, Cintura ${usuario.medidas.cintura}, Quadril ${usuario.medidas.quadril}, Altura ${usuario.medidas.altura}.
            - Tipo de Corpo: ${usuario.tipo_corpo}
            - Estilo: ${usuario.estilo_pessoal}
            
            O usuário quer looks para: "${userOccasion}".
            
            Peças Disponíveis:
            ${JSON.stringify(itemsForAI)}

            Gere exatamente 3 looks em JSON seguindo este esquema:
            { "looks": [ { "look_id": "...", "name": "...", "explanation": "...", "items": [{"id": "...", "name": "..."}], "body_affinity_index": 9.0 } ] }
        `;

        // 5. Chamar Gemini
        const model = genAIClient.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(systemInstruction);
        const responseText = result.response.text();
        const jsonResponse = JSON.parse(responseText);

        res.json(jsonResponse);

    } catch (error) {
        console.error("Erro ao gerar looks:", error);
        res.status(500).json({ error: "Erro interno ao processar looks com IA." });
    }
};
export const salvarEscolha = async (req, res) => {
    try {
        const userId = req.user._id;
        const { selectedLookId, allLooks } = req.body;

        if (!allLooks || !Array.isArray(allLooks)) {
            return res.status(400).json({ error: "Dados inválidos." });
        }

        // Vamos criar um ID único para essa 'batelada' de 3 looks
        const batchId = uuidv4();

        const looksToSave = allLooks.map(look => {
            const isSelected = look.look_id === selectedLookId;

            return {
                userId: userId,
                batch_id: batchId,
                nome: look.name,
                explicacao: look.explanation,
                itens: look.items,
                afinidade_ia: look.body_affinity_index,

                // Lógica de Pontuação/Relevância
                escolhido_pelo_usuario: isSelected,
                score_relevancia: isSelected ? 100 : 10 // Dá 100 pts pro escolhido, 10 pros outros (foram gerados, tem algum valor)
            };
        });

        // Salva todos de uma vez no banco
        await Look.insertMany(looksToSave);

        res.status(201).json({ message: "Preferência salva com sucesso!" });

    } catch (error) {
        console.error("Erro ao salvar escolha:", error);
        res.status(500).json({ error: "Erro ao salvar seus looks." });
    }
};