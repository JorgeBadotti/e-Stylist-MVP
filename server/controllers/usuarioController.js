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