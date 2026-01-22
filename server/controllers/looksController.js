import Usuario from '../models/UsuarioModel.js';
import GuardaRoupa from '../models/GuardaRoupa.js';
import Produto from '../models/Produto.js';
import Look from '../models/LookModel.js';
import DicionarioStyleMe from '../models/DicionarioStyleMe.js';
import { genAIClient } from '../services/gemini.js';
import { loadPrompt } from '../services/prompt_loader.js';
import { uploadImage } from '../services/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';

// ✅ NOVO: Map em memória para armazenar LookSessions
const lookSessions = new Map();

// ✅ NOVO: Função para limpar sessões expiradas (a cada 5 minutos)
const cleanupExpiredSessions = () => {
    const now = Date.now();
    for (const [sessionId, session] of lookSessions.entries()) {
        if (session.expiresAt < now) {
            lookSessions.delete(sessionId);
            console.log(`[LookSession] Sessão expirada removida: ${sessionId}`);
        }
    }
};

// Executar limpeza a cada 5 minutos
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// ✅ NOVO: Criar LookSession
export const createLookSession = async (req, res) => {
    try {
        const { itemObrigatorio, lojaId } = req.body;
        const userId = req.user._id;

        console.log(`[LookSession DEBUG] Procurando: skuStyleMe=${itemObrigatorio}, lojaId=${lojaId}`);

        // 1. Validar se itemObrigatorio existe na loja
        // OPÇÃO 1: Procurar com lojaId
        let produto = await Produto.findOne({
            skuStyleMe: itemObrigatorio,
            lojaId: lojaId
        });

        // OPÇÃO 2: Se não encontrou com lojaId, procurar apenas pelo SKU
        if (!produto) {
            console.log(`[LookSession DEBUG] Não encontrado com lojaId. Procurando apenas pelo SKU...`);
            produto = await Produto.findOne({
                skuStyleMe: itemObrigatorio
            });

            if (produto) {
                console.log(`[LookSession DEBUG] Produto encontrado: ${JSON.stringify(produto)}`);
            }
        }

        if (!produto) {
            console.log(`[LookSession] Peça ${itemObrigatorio} não encontrada na loja ${lojaId}`);
            return res.status(404).json({ error: "Peça não encontrada nesta loja." });
        }

        // 2. Criar sessão em memória
        const sessionId = uuidv4();
        const session = {
            sessionId,
            userId,
            itemObrigatorio,
            lojaId,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutos
        };

        lookSessions.set(sessionId, session);

        console.log(`[LookSession] ${sessionId} criada com itemObrigatorio: ${itemObrigatorio}, lojaId: ${lojaId}`);

        res.json({
            sessionId,
            itemObrigatorio,
            lojaId,
            message: "Sessão criada com sucesso"
        });

    } catch (error) {
        console.error("[LookSession] Erro ao criar sessão:", error);
        res.status(500).json({ error: "Erro ao criar sessão de look." });
    }
};

export const gerarLooks = async (req, res) => {
    console.log("Dentro de Gerar Looks");
    try {
        const { sessionId, wardrobeId, prompt: userOccasion } = req.body;
        const userId = req.user._id;

        // ✅ NOVO: Verificar se é nova abordagem (sessionId) ou antiga (wardrobeId)
        let itemObrigatorio = null;
        let lojaId = null;

        if (sessionId) {
            // NOVO FLUXO: LookSession
            const session = lookSessions.get(sessionId);
            if (!session) {
                return res.status(404).json({ error: "Sessão de look não encontrada ou expirada." });
            }

            itemObrigatorio = session.itemObrigatorio;
            lojaId = session.lojaId;
            console.log(`[LookSession ${sessionId}] Gerando looks com itemObrigatorio: ${itemObrigatorio}, lojaId: ${lojaId}`);
        } else if (wardrobeId) {
            // FLUXO ANTIGO: Guarda-roupa (manter compatibilidade)
            console.log(`[LooksPage] Fluxo antigo (guarda-roupa): ${wardrobeId}`);
        } else {
            return res.status(400).json({ error: "Forneça sessionId ou wardrobeId." });
        }

        // 1. Buscar Perfil do Usuário
        const usuario = await Usuario.findById(userId);
        if (!usuario || !usuario.medidas) {
            return res.status(400).json({ error: "Perfil incompleto. Necessário medidas e foto." });
        }

        // ✅ NOVO: Se tem itemObrigatorio, buscar seus dados
        let itemObrigatorioData = null;
        if (itemObrigatorio) {
            itemObrigatorioData = await Produto.findOne({ skuStyleMe: itemObrigatorio });
            if (!itemObrigatorioData) {
                return res.status(400).json({ error: `Peça obrigatória ${itemObrigatorio} não encontrada.` });
            }
            console.log(`[LookSession] Peça obrigatória carregada: ${itemObrigatorioData.nome}`);
        }

        // 2. Buscar Produtos (por Loja ou Guarda-Roupa)
        let produtos;
        if (lojaId) {
            // NOVO: Buscar TUDO da loja
            console.log(`[LookSession] Buscando produtos da loja: ${lojaId}`);
            produtos = await Produto.find({ lojaId: lojaId });
        } else {
            // ANTIGO: Buscar do guarda-roupa
            console.log("Buscando produtos para o guarda-roupa:", wardrobeId);
            produtos = await Produto.find({ guardaRoupaId: wardrobeId });
        }

        // ✅ NOVO: Se tem itemObrigatorio, excluir da lista (será adicionado obrigatoriamente)
        if (itemObrigatorio) {
            const countAntes = produtos.length;
            produtos = produtos.filter(p => p.skuStyleMe !== itemObrigatorio);
            console.log(`[LookSession] Produtos: ${countAntes} total, ${produtos.length} sem obrigatória`);
        }

        console.log("Produtos encontrados:", produtos.length);
        if (produtos.length < 2) {
            return res.status(400).json({ error: "Guarda-roupa precisa ter pelo menos 2 peças para gerar looks." });
        }

        // 3. Preparar Dados para o Gemini (Usando SKU + Cor Extensa)
        // Buscar o dicionário de cores
        const coresDict = await DicionarioStyleMe.find({ tipo: 'COR' });
        const coresMap = {};
        coresDict.forEach(cor => {
            coresMap[cor.codigo] = cor.descricao;
        });

        const itemsForAI = produtos.map(r => ({
            sku: r.skuStyleMe,
            nome: r.nome || r.descricao,
            cor: coresMap[r.cor_codigo] || r.cor_codigo || 'sem cor especificada',
            tamanho: r.tamanho || '',
            categoria: r.categoria || ''
        }));

        // ✅ NOVO: Se tem itemObrigatorio, adicionar aos items com tag especial
        let promptItems = itemsForAI;
        let itemObrigatorioInfo = '';
        if (itemObrigatorio && itemObrigatorioData) {
            const obrigatorioItem = {
                sku: itemObrigatorioData.skuStyleMe,
                nome: itemObrigatorioData.nome || itemObrigatorioData.descricao,
                cor: coresMap[itemObrigatorioData.cor_codigo] || itemObrigatorioData.cor_codigo || 'sem cor',
                tamanho: itemObrigatorioData.tamanho || '',
                categoria: itemObrigatorioData.categoria || '',
                isObrigatorio: true // ✅ Tag para a IA saber que é obrigatória
            };
            promptItems = [obrigatorioItem, ...itemsForAI]; // Colocar obrigatória primeiro
            itemObrigatorioInfo = `**[IMPORTANTE]** Esta peça DEVE estar em TODOS os looks gerados: ${itemObrigatorioData.nome} (${itemObrigatorioData.skuStyleMe})`;
            console.log(`[LookSession] Adicionado item obrigatório ao prompt`);
        }

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
            itemObrigatorioInfo: itemObrigatorioInfo, // ✅ Passar como variável separada
            items_json: JSON.stringify(promptItems) // ✅ Usar promptItems com obrigatória
        });

        // 5. Chamar Gemini
        const model = genAIClient.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(systemInstruction);
        const responseText = result.response.text();
        const jsonResponse = JSON.parse(responseText);

        // 6. Enriquecer os itens com dados do Produto (usando SKU como chave)
        if (jsonResponse.looks && Array.isArray(jsonResponse.looks)) {
            // Criar mapa de produtos por SKU para busca rápida
            const produtoMapBySku = {};
            produtos.forEach(p => {
                produtoMapBySku[p.skuStyleMe] = p;
            });

            // ✅ NOVO: Se tem itemObrigatorio, adicionar ao mapa mesmo que tenha sido filtrado
            if (itemObrigatorioData) {
                produtoMapBySku[itemObrigatorioData.skuStyleMe] = itemObrigatorioData;
            }

            for (const look of jsonResponse.looks) {
                if (look.items && Array.isArray(look.items)) {
                    // Buscar dados completos de cada item usando SKU
                    const itemsEnriquecidos = look.items.map((item) => {
                        const produto = produtoMapBySku[item.sku];

                        if (produto) {
                            return {
                                id: produto._id, // Manter ID para referência
                                sku: item.sku,
                                name: item.name || produto.nome || produto.descricao,
                                foto: produto.foto || null,
                                cor: coresMap[produto.cor_codigo] || produto.cor_codigo || null,
                                cor_codigo: produto.cor_codigo || null,
                                categoria: produto.categoria || null,
                                tamanho: produto.tamanho || null,
                                skuStyleMe: produto.skuStyleMe || null
                            };
                        }
                        // Se não encontrar, retorna item com aviso
                        console.warn(`Produto com SKU ${item.sku} não encontrado no mapa`);
                        return item;
                    });
                    look.items = itemsEnriquecidos;
                }
            }
        }

        // ✅ NOVO: Log final da LookSession
        if (itemObrigatorio) {
            console.log(`[LookSession] ${jsonResponse.looks?.length || 0} looks gerados com peça obrigatória: ${itemObrigatorio}`);
        }

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

        // ENRIQUECIMENTO: Validar e enriquecer itens
        const looksFormatados = await Promise.all(
            looks.map(async (look) => {
                // Enriquecer itens: validar produtos e complementar dados se necessário
                let itensEnriquecidos = look.itens;

                if (itensEnriquecidos && Array.isArray(itensEnriquecidos)) {
                    // Buscar os produtos pelo ID para validação e enriquecimento
                    const produtoIds = itensEnriquecidos
                        .map(item => item.id)
                        .filter(id => id); // Remove undefined/null

                    let produtoMap = {};
                    if (produtoIds.length > 0) {
                        const produtos = await Produto.find({
                            _id: { $in: produtoIds }
                        });

                        // Criar mapa: ID → Produto
                        produtos.forEach(p => {
                            produtoMap[p._id.toString()] = p;
                        });
                    }

                    // Enriquecer cada item: dados do BD + dados salvos (desnormalizados)
                    itensEnriquecidos = itensEnriquecidos.map(item => {
                        const produto = produtoMap[item.id];

                        // Se produto existe no BD, usar dados atualizados; caso contrário, manter desnormalizados
                        if (produto) {
                            // Usar dados salvos + validação com BD
                            return {
                                ...item, // Manter todos os dados salvos (foto, cor, etc)
                                _id: produto._id,
                                categoria: produto.categoria || item.categoria,
                                tamanho: produto.tamanho || item.tamanho,
                                skuStyleMe: produto.skuStyleMe || item.sku,
                                // Se a foto foi deletada, mantém a salva
                                foto: item.foto || produto.foto
                            };
                        }

                        // Produto deletado: retorna dados desnormalizados que foram salvos
                        return {
                            ...item,
                            _deletado: true // Flag indicando que o produto não existe mais
                        };
                    });
                }

                return {
                    _id: look._id,
                    nome: look.nome,
                    explicacao: look.explicacao,
                    itens: itensEnriquecidos,
                    afinidade_ia: look.afinidade_ia,
                    escolhido_pelo_usuario: look.escolhido_pelo_usuario,
                    imagem_visualizada: look.imagem_visualizada,
                    data_visualizacao: look.data_visualizacao,
                    createdAt: look.create_date,
                    temVisualizacao: !!look.imagem_visualizada
                };
            })
        );

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

        // ENRIQUECIMENTO: Validar e enriquecer itens com dados do BD
        let itensEnriquecidos = look.itens;

        if (itensEnriquecidos && Array.isArray(itensEnriquecidos)) {
            // Buscar os produtos pelo ID para validação e enriquecimento
            const produtoIds = itensEnriquecidos
                .map(item => item.id)
                .filter(id => id); // Remove undefined/null

            let produtoMap = {};
            if (produtoIds.length > 0) {
                const produtos = await Produto.find({
                    _id: { $in: produtoIds }
                });

                // Criar mapa: ID → Produto
                produtos.forEach(p => {
                    produtoMap[p._id.toString()] = p;
                });
            }

            // Enriquecer cada item
            itensEnriquecidos = itensEnriquecidos.map(item => {
                const produto = produtoMap[item.id];

                if (produto) {
                    return {
                        ...item,
                        _id: produto._id,
                        categoria: produto.categoria || item.categoria,
                        tamanho: produto.tamanho || item.tamanho,
                        skuStyleMe: produto.skuStyleMe || item.sku,
                        foto: item.foto || produto.foto,
                        layer_role: produto.layer_role,
                        color_role: produto.color_role,
                        fit: produto.fit,
                        style_base: produto.style_base
                    };
                }

                // Produto deletado: retorna dados desnormalizados
                return {
                    ...item,
                    _deletado: true
                };
            });
        }

        // Formata resposta com detalhes completos
        const lookDetalhado = {
            _id: look._id,
            nome: look.nome,
            explicacao: look.explicacao,
            itens: itensEnriquecidos,
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

        // 3. Buscar as informações completas dos produtos usando SKU
        const skus = lookData.items.map(item => item.skuStyleMe || item.sku);
        const produtosDB = await Produto.find({ skuStyleMe: { $in: skus } });

        console.log("Produtos encontrados no DB:", produtosDB.length);

        if (produtosDB.length === 0) {
            return res.status(400).json({ error: "Nenhuma peça encontrada no banco de dados." });
        }

        // 4. Criar mapa dos produtos por SKU para fácil acesso
        const produtoMap = {};
        produtosDB.forEach(produto => {
            produtoMap[produto.skuStyleMe] = produto;
        });

        // 5. Buscar dicionário de cores para enriquecimento
        const coresDict = await DicionarioStyleMe.find({ tipo: 'COR' });
        const coresMap = {};
        coresDict.forEach(cor => {
            coresMap[cor.codigo] = cor.descricao;
        });

        // 6. Enriquecer os items com dados do banco de dados e filtrar os que têm foto
        const itemsComFoto = [];
        const itemsSemFoto = [];

        for (const item of lookData.items) {
            const sku = item.skuStyleMe || item.sku;
            const produto = produtoMap[sku];

            if (produto) {
                if (produto.foto) {
                    itemsComFoto.push({
                        id: produto._id,
                        sku: produto.skuStyleMe,
                        name: item.name || produto.nome || produto.descricao,
                        foto: produto.foto,
                        cor: coresMap[produto.cor_codigo] || produto.cor_codigo,
                        cor_codigo: produto.cor_codigo,
                        categoria: produto.categoria,
                        tamanho: produto.tamanho
                    });
                } else {
                    itemsSemFoto.push(item.name || produto.nome);
                }
            } else {
                itemsSemFoto.push(item.name);
            }
        }

        // 7. Se houver items sem foto, avisar ao usuário
        if (itemsSemFoto.length > 0) {
            console.warn("Items sem foto encontrados:", itemsSemFoto);
            return res.status(400).json({
                error: `As seguintes peças não possuem foto de referência: ${itemsSemFoto.join(', ')}. Adicione fotos para gerar a visualização.`
            });
        }

        // 8. Preparar as URLs das fotos para o Gemini
        const fotoPessoa = usuario.foto_corpo;
        const fotasPecas = itemsComFoto.map(item => item.foto);

        console.log("Fotos das peças coletadas:", fotasPecas.length);

        // 9. Preparar descrição detalhada dos items para o prompt
        const itemsDescription = itemsComFoto.map(item => {
            return `- ${item.nome || item.name}${item.categoria ? ' (' + item.categoria + ')' : ''}${item.cor ? ' - ' + item.cor : ''}${item.tamanho ? ' (' + item.tamanho + ')' : ''}`;
        }).join('\n');

        console.log("Items description:\n", itemsDescription);

        // 10. Carrega o prompt do arquivo
        const promptText = await loadPrompt('vizualize_look.md', {
            look_description: lookData.explanation || lookData.name,
            items_list: itemsDescription
        });

        console.log("Prompt carregado com sucesso");

        // 11. Função auxiliar para converter URL de imagem para base64
        const fetchImageAsBase64 = async (imageUrl) => {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer).toString('base64');
        };

        // 12. Buscar as imagens como base64
        console.log("Convertendo imagem da pessoa para base64...");
        const fotoPessoaBase64 = await fetchImageAsBase64(fotoPessoa);

        console.log("Convertendo imagens das peças para base64...");
        const fotasPecasBase64 = [];
        for (const fotoUrl of fotasPecas) {
            const base64 = await fetchImageAsBase64(fotoUrl);
            fotasPecasBase64.push(base64);
        }

        console.log("Total de imagens em base64:", fotasPecasBase64.length + 1);

        // 13. Montar o array de parts para Gemini (texto + imagens)
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

        // 14. Chamar Gemini 3 Pro Image Preview para gerar a imagem
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

        // 15. Extrair a imagem gerada
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

        // 16. Faz upload para Cloudinary
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