import Usuario from '../models/UsuarioModel.js';
import GuardaRoupa from '../models/GuardaRoupa.js';
import Produto from '../models/Produto.js';
import Look from '../models/LookModel.js';
import { genAIClient } from '../services/gemini.js';
import { loadPrompt } from '../services/prompt_loader.js';
import { uploadImage } from '../services/cloudinary.js';
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

        // 2. Buscar Produtos do Guarda-Roupa Selecionado
        console.log("Buscando produtos para o guarda-roupa:", wardrobeId);
        const produtos = await Produto.find({ guardaRoupa: wardrobeId });
        console.log("Produtos encontrados:", produtos.length);
        if (produtos.length < 2) {
            return res.status(400).json({ error: "Guarda-roupa precisa ter pelo menos 2 peças para gerar looks." });
        }

        // 3. Preparar Dados para o Gemini (Mapeando para o formato que definimos nos prompts)
        const itemsForAI = produtos.map(r => ({
            id: r._id,
            name: r.nome || r.descricao,
            cor: r.cor || 'sem cor especificada',
            tamanho: r.tamanho || '',
            categoria: r.categoria || '',
            source: 'closet'
        }));

        // 4. Carregar o Prompt do arquivo e fazer as substituições
        const systemInstruction = await loadPrompt('generate_look.md', {
            user_name: usuario.nome,
            bust: usuario.medidas.busto.toString(),
            waist: usuario.medidas.cintura.toString(),
            hips: usuario.medidas.quadril.toString(),
            height: usuario.medidas.altura.toString(),
            body_type: usuario.tipo_corpo,
            personal_style: usuario.estilo_pessoal,
            user_prompt: userOccasion,
            items_json: JSON.stringify(itemsForAI)
        });

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
        const savedLooks = await Look.insertMany(looksToSave);

        // Encontra o look que foi escolhido pelo usuário
        const selectedLook = savedLooks.find(look => look.nome === allLooks.find(l => l.look_id === selectedLookId)?.name);

        res.status(201).json({
            message: "Preferência salva com sucesso!",
            savedLookId: selectedLook._id
        });

    } catch (error) {
        console.error("Erro ao salvar escolha:", error);
        res.status(500).json({ error: "Erro ao salvar seus looks." });
    }
};

export const listarMeusLooks = async (req, res) => {
    console.log("Dentro de Listar Meus Looks");
    try {
        const userId = req.user._id;
        const { page = 1, limit = 12 } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Busca looks do usuário atual com paginação
        const looks = await Look.find({ userId })
            .sort({ data_visualizacao: -1, create_date: -1 })
            .skip(skip)
            .limit(limitNum);

        // Total de looks para pagination
        const totalLooks = await Look.countDocuments({ userId });

        // Formata resposta
        const looksFormatados = looks.map(look => ({
            _id: look._id,
            nome: look.nome,
            explicacao: look.explicacao,
            itens: look.itens,
            afinidade_ia: look.afinidade_ia,
            escolhido_pelo_usuario: look.escolhido_pelo_usuario,
            imagem_visualizada: look.imagem_visualizada,
            data_visualizacao: look.data_visualizacao,
            createdAt: look.create_date,
            temVisualizacao: !!look.imagem_visualizada
        }));

        res.json({
            looks: looksFormatados,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalLooks / limitNum),
                totalLooks,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Erro ao listar looks:", error);
        res.status(500).json({ error: "Erro ao listar seus looks." });
    }
};

export const obterDetalhesComunsLook = async (req, res) => {
    console.log("Dentro de Obter Detalhes Look");
    try {
        const userId = req.user._id;
        const { lookId } = req.params;

        // Busca o look específico
        const look = await Look.findOne({ _id: lookId, userId });

        if (!look) {
            return res.status(404).json({ error: "Look não encontrado." });
        }

        // Formata resposta com detalhes completos
        const lookDetalhado = {
            _id: look._id,
            nome: look.nome,
            explicacao: look.explicacao,
            itens: look.itens,
            afinidade_ia: look.afinidade_ia,
            escolhido_pelo_usuario: look.escolhido_pelo_usuario,
            score_relevancia: look.score_relevancia,
            imagem_visualizada: look.imagem_visualizada,
            imagem_visualizada_publicId: look.imagem_visualizada_publicId,
            data_visualizacao: look.data_visualizacao,
            createdAt: look.create_date
        };

        res.json(lookDetalhado);

    } catch (error) {
        console.error("Erro ao obter detalhes do look:", error);
        res.status(500).json({ error: "Erro ao obter detalhes do look." });
    }
};

export const visualizarLook = async (req, res) => {
    console.log("Dentro de Visualizar Look");
    try {
        const userId = req.user._id;
        const { lookData } = req.body;

        console.log("LookData recebido:", lookData);

        // 1. Validar dados de entrada
        if (!lookData || !lookData.items || !Array.isArray(lookData.items)) {
            return res.status(400).json({ error: "Look inválido. Necessário array de items." });
        }

        // 2. Buscar o usuário e validar foto de corpo
        const usuario = await Usuario.findById(userId);
        if (!usuario || !usuario.foto_corpo) {
            return res.status(400).json({ error: "Necessário foto de corpo inteiro do usuário." });
        }

        // 3. Buscar as fotos de todas as peças do look
        const itemIds = lookData.items.map(item => item.id);
        const roupas = await Roupa.find({ _id: { $in: itemIds } });

        if (roupas.length !== itemIds.length) {
            return res.status(400).json({ error: "Algumas peças não foram encontradas." });
        }

        // 4. Validar que todas as peças têm foto
        const roupasComFoto = roupas.filter(r => r.foto);
        if (roupasComFoto.length !== roupas.length) {
            return res.status(400).json({ error: "Algumas peças não têm foto de referência." });
        }

        // 5. Preparar as URLs das fotos para o Gemini
        const fotoPessoa = usuario.foto_corpo;
        const fotasPecas = roupasComFoto.map(r => r.foto);

        // 6. Carrega o prompt do arquivo
        const promptText = await loadPrompt('vizualize_look.md', {
            look_description: lookData.explanation || lookData.name
        });

        // 7. Função auxiliar para converter URL de imagem para base64
        const fetchImageAsBase64 = async (imageUrl) => {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer).toString('base64');
        };

        // 8. Buscar as imagens como base64
        const fotoPessoaBase64 = await fetchImageAsBase64(fotoPessoa);
        const fotasPecasBase64 = [];
        for (const fotoUrl of fotasPecas) {
            const base64 = await fetchImageAsBase64(fotoUrl);
            fotasPecasBase64.push(base64);
        }

        // 9. Montar o array de parts para Gemini (texto + imagens)
        const parts = [
            {
                text: promptText
            }
        ];

        // Adiciona a foto da pessoa
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: fotoPessoaBase64
            }
        });

        // Adiciona as fotos das peças
        for (const fotoBase64 of fotasPecasBase64) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: fotoBase64
                }
            });
        }

        // 10. Chamar Gemini 3 Pro Image Preview para gerar a imagem
        const model = genAIClient.getGenerativeModel({
            model: "gemini-3-pro-image-preview"
        });

        console.log("Chamando Gemini para gerar imagem...");
        const response = await model.generateContent({
            contents: [{
                parts: parts
            }],
            generationConfig: {
                response_modalities: ['TEXT', 'IMAGE'],
                image_config: {
                    aspect_ratio: '3:4',
                    image_size: '1K'
                }
            }
        });

        console.log("Resposta recebida do Gemini");

        // 11. Extrair a imagem gerada
        let geradoImagemBuffer = null;
        let imagemDescricao = '';

        // Acessa a resposta corretamente
        const responseParts = response.response.candidates?.[0]?.content?.parts || [];
        console.log("Parts recebidas:", responseParts.length);

        for (const part of responseParts) {
            if (part.text) {
                imagemDescricao = part.text;
                console.log("Descrição:", imagemDescricao);
            }
            // Verifica se tem dados de imagem
            if (part.inlineData?.data) {
                try {
                    // Os dados podem vir como base64 string ou Uint8Array
                    let dados = part.inlineData.data;
                    if (typeof dados === 'string') {
                        // É base64 string
                        geradoImagemBuffer = Buffer.from(dados, 'base64');
                    } else if (dados instanceof Uint8Array) {
                        // É Uint8Array
                        geradoImagemBuffer = Buffer.from(dados);
                    } else {
                        // Tenta converter como buffer
                        geradoImagemBuffer = Buffer.from(dados);
                    }
                    console.log("Imagem gerada com sucesso - tamanho:", geradoImagemBuffer.length);
                } catch (e) {
                    console.error("Erro ao converter dados da imagem:", e);
                }
            }
        }

        if (!geradoImagemBuffer) {
            throw new Error("Gemini não conseguiu gerar a imagem - nenhuma imagem encontrada na resposta");
        }

        // 12. Faz upload para Cloudinary
        const cloudinaryResult = await uploadImage(
            geradoImagemBuffer,
            'looks-visualizacoes'
        );

        console.log("Upload Cloudinary sucesso:", cloudinaryResult.secure_url);

        // 13. Atualiza o Look no banco com a imagem gerada
        const lookId = lookData._id;
        if (!lookId) {
            return res.status(400).json({ error: "ID do look não fornecido." });
        }

        const updatedLook = await Look.findByIdAndUpdate(
            lookId,
            {
                imagem_visualizada: cloudinaryResult.secure_url,
                imagem_visualizada_publicId: cloudinaryResult.public_id,
                data_visualizacao: new Date()
            },
            { new: true }
        );

        console.log("Look atualizado:", updatedLook);

        res.status(201).json({
            message: "Look visualizado com sucesso!",
            imagem_url: cloudinaryResult.secure_url,
            look: updatedLook
        });

    } catch (error) {
        console.error("Erro ao visualizar look:", error);
        res.status(500).json({ error: "Erro ao gerar visualização do look.", detalhes: error.message });
    }
};