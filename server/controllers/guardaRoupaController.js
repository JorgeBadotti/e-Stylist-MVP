import GuardaRoupa from '../models/GuardaRoupa.js'; // Ajuste o caminho conforme sua estrutura

export const createGuardaRoupa = async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        // Pega o ID do usuário logado (vindo do Passport/Auth middleware)
        const usuarioId = req.user._id;

        const novoGuardaRoupa = await GuardaRoupa.create({
            nome,
            descricao,
            usuario: usuarioId
        });

        res.status(201).json(novoGuardaRoupa);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar guarda-roupa', error: error.message });
    }
};

export const getMeusGuardaRoupas = async (req, res) => {
    try {
        const usuarioId = req.user._id;

        // Busca apenas os guarda-roupas deste usuário
        const guardaRoupas = await GuardaRoupa.find({ usuario: usuarioId });

        res.status(200).json(guardaRoupas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar guarda-roupas', error: error.message });
    }
};

export const getGuardaRoupaById = async (req, res) => {
    try {
        const { id } = req.params;

        const guardaRoupa = await GuardaRoupa.findOne({ _id: id, usuario: req.user._id });

        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado ou acesso negado' });
        }

        res.status(200).json(guardaRoupa);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar detalhes', error: error.message });
    }
};

export const deleteGuardaRoupa = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await GuardaRoupa.findOneAndDelete({ _id: id, usuario: req.user._id });

        if (!deleted) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        // Opcional: Aqui você poderia deletar também todas as Roupas associadas a este ID

        res.status(200).json({ message: 'Guarda-roupa deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar', error: error.message });
    }
};