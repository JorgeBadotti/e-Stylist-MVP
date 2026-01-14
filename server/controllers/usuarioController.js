import Usuario from '../models/UsuarioModel.js';

// Atualizar dados do perfil (Nome, Medidas, Fotos e Estilo)
export const updateBodyData = async (req, res) => {
    try {
        // Pega o ID do usuário logado (garantido pelo middleware de auth)
        const userId = req.user._id;

        const {
            nome,          // NOVO: Frontend agora envia o nome
            busto,
            cintura,
            quadril,
            altura,
            tipo_corpo,
            estilo_pessoal,
            foto_corpo     // Chega como URL ou Base64 String
        } = req.body;

        // Monta o objeto de atualização
        const updateData = {
            medidas: {
                busto: Number(busto),
                cintura: Number(cintura),
                quadril: Number(quadril),
                altura: Number(altura)
            },
            tipo_corpo,
            estilo_pessoal
        };

        // Atualiza o nome apenas se vier preenchido
        if (nome) {
            updateData.nome = nome;
        }

        // Atualiza a foto apenas se ela for enviada
        // NOTA: Como estamos recebendo Base64, a string será grande.
        if (foto_corpo) {
            updateData.foto_corpo = foto_corpo;
        }

        const userUpdated = await Usuario.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true } // Retorna o objeto atualizado
        );

        if (!userUpdated) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({
            message: 'Perfil atualizado com sucesso',
            user: {
                id: userUpdated._id,
                nome: userUpdated.nome,
                email: userUpdated.email,
                medidas: userUpdated.medidas,
                tipo_corpo: userUpdated.tipo_corpo,
                foto_corpo: userUpdated.foto_corpo,
                estilo_pessoal: userUpdated.estilo_pessoal
            }
        });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
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