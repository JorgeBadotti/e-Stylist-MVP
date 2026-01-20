import Usuario from '../models/UsuarioModel.js';

// Atualizar dados do perfil (Nome, Medidas, Fotos e Estilo)
export const updateBodyData = async (req, res) => {
    try {
        // Pega o ID do usuário logado (garantido pelo middleware de auth)
        const userId = req.user._id;

        const {
            nome,
            cpf,
            sexo,                      // ✅ NOVO: Sexo do usuário
            altura_cm,                 // ✅ NOVO: Altura em cm
            tipo_corpo,
            estilo_pessoal,
            foto_corpo,
            medidas,                   // ✅ NOVO: Objeto completo com 18 campos
            proporcoes                 // ✅ NOVO: Objeto com proporções
        } = req.body;

        // Monta o objeto de atualização com suporte para todos os campos
        const updateData = {};

        // Dados básicos
        if (nome) updateData.nome = nome;
        if (cpf) updateData.cpf = cpf;
        if (sexo) updateData.sexo = sexo;
        if (altura_cm) updateData.altura_cm = altura_cm;
        if (tipo_corpo) updateData.tipo_corpo = tipo_corpo;
        if (estilo_pessoal) updateData.estilo_pessoal = estilo_pessoal;
        if (foto_corpo) updateData.foto_corpo = foto_corpo;

        // Processamento de medidas (18 campos)
        if (medidas) {
            updateData.medidas = {
                // Campos básicos
                busto: medidas.busto ? Number(medidas.busto) : undefined,
                cintura: medidas.cintura ? Number(medidas.cintura) : undefined,
                quadril: medidas.quadril ? Number(medidas.quadril) : undefined,
                altura: medidas.altura ? Number(medidas.altura) : undefined,

                // Medidas superiores
                pescoco: medidas.pescoco ? Number(medidas.pescoco) : undefined,
                ombro: medidas.ombro ? Number(medidas.ombro) : undefined,
                braco: medidas.braco ? Number(medidas.braco) : undefined,
                antebraco: medidas.antebraco ? Number(medidas.antebraco) : undefined,
                pulso: medidas.pulso ? Number(medidas.pulso) : undefined,
                torax: medidas.torax ? Number(medidas.torax) : undefined,
                sobpeito: medidas.sobpeito ? Number(medidas.sobpeito) : undefined,
                costelas: medidas.costelas ? Number(medidas.costelas) : undefined,

                // Medidas inferiores
                panturrilha: medidas.panturrilha ? Number(medidas.panturrilha) : undefined,
                coxa: medidas.coxa ? Number(medidas.coxa) : undefined,
                tornozelo: medidas.tornozelo ? Number(medidas.tornozelo) : undefined,

                // Comprimentos
                comprimento_torso: medidas.comprimento_torso ? Number(medidas.comprimento_torso) : undefined,
                comprimento_perna: medidas.comprimento_perna ? Number(medidas.comprimento_perna) : undefined,
                comprimento_braco: medidas.comprimento_braco ? Number(medidas.comprimento_braco) : undefined
            };

            // Remove undefined para evitar sobrescrever valores existentes
            Object.keys(updateData.medidas).forEach(key =>
                updateData.medidas[key] === undefined && delete updateData.medidas[key]
            );
        }

        // Processamento de proporções
        if (proporcoes) {
            updateData.proporcoes = {
                pernas: proporcoes.pernas || undefined,
                torso: proporcoes.torso || undefined,
                ombros_vs_quadril: proporcoes.ombros_vs_quadril || undefined,
                confidence: proporcoes.confidence ? Number(proporcoes.confidence) : undefined
            };

            // Remove undefined
            Object.keys(updateData.proporcoes).forEach(key =>
                updateData.proporcoes[key] === undefined && delete updateData.proporcoes[key]
            );
        }

        console.log('👤 [updateBodyData] Atualizando usuário:', { userId, updateData });

        const userUpdated = await Usuario.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!userUpdated) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        console.log('✅ [updateBodyData] Usuário atualizado com sucesso');

        res.status(200).json({
            message: 'Perfil atualizado com sucesso',
            user: {
                id: userUpdated._id,
                nome: userUpdated.nome,
                email: userUpdated.email,
                cpf: userUpdated.cpf,
                sexo: userUpdated.sexo,
                altura_cm: userUpdated.altura_cm,
                foto_corpo: userUpdated.foto_corpo,
                tipo_corpo: userUpdated.tipo_corpo,
                estilo_pessoal: userUpdated.estilo_pessoal,
                medidas: userUpdated.medidas,
                proporcoes: userUpdated.proporcoes
            }
        });

    } catch (error) {
        console.error("❌ [updateBodyData] Erro ao atualizar perfil:", error);
        res.status(500).json({ error: 'Erro ao atualizar dados do perfil.' });
    }
};

// Obter perfil completo
export const getProfile = async (req, res) => {
    try {
        const user = await Usuario.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ NOVO: Obter usuário por ID com lojas_associadas populadas
export const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findById(id).populate('lojas_associadas');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({
            user,
            lojas_associadas: user.lojas_associadas || []
        });
    } catch (error) {
        console.error("❌ [getUsuarioById] Erro ao buscar usuário:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ NOVO: Analisar foto do corpo e descrever características
export const describeBody = async (req, res) => {
    try {
        const userId = req.user._id;
        const { foto_base64 } = req.body;

        if (!foto_base64) {
            return res.status(400).json({ error: "Foto não fornecida" });
        }

        console.log('👁️ [describeBody] Analisando foto do corpo do usuário:', userId);

        // Importações necessárias para usar Gemini e loadPrompt
        const { genAIClient } = await import('../services/gemini.js');
        const { loadPrompt } = await import('../services/prompt_loader.js');

        // Extrair dados base64 (remover prefixo "data:image/...;base64,")
        const base64Data = foto_base64.split(',')[1] || foto_base64;
        const buffer = Buffer.from(base64Data, 'base64');

        // Obter o modelo Gemini para análise de imagens
        const model = genAIClient.getGenerativeModel({
            model: 'gemini-2.0-flash-exp'
        });

        // Carregar prompt do arquivo analyze_body.md
        const promptText = await loadPrompt('analyze_body.md', {});

        const resposta = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg'
                }
            },
            promptText
        ]);

        const texto = resposta.response.text();
        console.log('🤖 ============ RESPOSTA COMPLETA DO GEMINI (describeBody) ============');
        console.log(texto);
        console.log('🤖 ============ FIM DA RESPOSTA ============');

        // Extrair JSON da resposta
        const jsonMatch = texto.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Não foi possível extrair JSON da análise do corpo');
        }

        const analise = JSON.parse(jsonMatch[0]);
        console.log('✅ [describeBody] Análise JSON Parseada:');
        console.log(JSON.stringify(analise, null, 2));
        console.log('✅ [describeBody] Proporções recebidas:', analise.proportions);
        console.log('✅ [describeBody] ombros_vs_quadril (raw):', analise.proportions?.ombros_vs_quadril);
        console.log('✅ [describeBody] Tipo de corpo:', analise.bodyType);
        console.log('✅ [describeBody] Sexo:', analise.sexo);
        console.log('✅ [describeBody] Medidas:', analise.measurements);
        console.log('✅ [describeBody] Análise concluída com sucesso');

        // Mapear nomes de campos de voltar em português (compatível com UsuarioModel)
        const mapeamentos = {
            'hourglass': 'ampulheta',
            'rectangle': 'retangulo',
            'pear': 'pera',
            'apple': 'maca',
            'inverted-triangle': 'triangulo-invertido'
        };

        const tipoCorpoMapeado = mapeamentos[analise.bodyType?.toLowerCase()] || analise.bodyType;

        res.status(200).json({
            message: "Corpo analisado com sucesso",
            analise: {
                sexo: analise.sexo || null,
                altura_estimada_cm: analise.measurements?.height || 0,
                tipo_corpo: tipoCorpoMapeado,
                proporcoes: {
                    pernas: analise.proportions?.pernas || null,
                    torso: analise.proportions?.torso || null,
                    ombros_vs_quadril: analise.proportions?.ombros_vs_quadril || null
                },
                medidas: {
                    // Medidas básicas
                    busto: analise.measurements?.bust || 0,
                    cintura: analise.measurements?.waist || 0,
                    quadril: analise.measurements?.hips || 0,
                    altura: analise.measurements?.height || 0,
                    // Medidas superiores
                    pescoco: analise.measurements?.neck || 0,
                    ombro: analise.measurements?.shoulder || 0,
                    braco: analise.measurements?.arm || 0,
                    antebraco: analise.measurements?.forearm || 0,
                    pulso: analise.measurements?.wrist || 0,
                    torax: analise.measurements?.chest || 0,
                    sobpeito: analise.measurements?.underBust || 0,
                    costelas: analise.measurements?.ribs || 0,
                    // Medidas inferiores
                    coxa: analise.measurements?.thigh || 0,
                    panturrilha: analise.measurements?.calf || 0,
                    tornozelo: analise.measurements?.ankle || 0,
                    // Comprimentos
                    comprimento_torso: analise.measurements?.torsoLength || 0,
                    comprimento_perna: analise.measurements?.legLength || 0,
                    comprimento_braco: analise.measurements?.armLength || 0
                },
                descricao: analise.descricao || "Análise corporal realizada",
                confianca: analise.confidence || 75
            }
        });

    } catch (error) {
        console.error("❌ [describeBody] Erro ao descrever corpo:", error);
        res.status(500).json({
            error: "Erro ao analisar corpo.",
            detalhes: error.message
        });
    }
};