import Roupa from '../models/Roupa.js';
import GuardaRoupa from '../models/GuardaRoupa.js';

export const addRoupa = async (req, res) => {
    try {
        const { nome, categoria, cor, tamanho, tecido, guardaRoupaId, foto } = req.body;

        // Validação extra: Verificar se o guarda-roupa pertence ao usuário logado antes de adicionar
        const donoGuardaRoupa = await GuardaRoupa.findOne({ _id: guardaRoupaId, usuario: req.user._id });

        if (!donoGuardaRoupa) {
            return res.status(403).json({ message: 'Guarda-roupa inválido ou acesso negado' });
        }

        const novaRoupa = await Roupa.create({
            nome,
            categoria,
            cor,
            tamanho,
            tecido,
            foto,
            guardaRoupa: guardaRoupaId
        });

        res.status(201).json(novaRoupa);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar roupa', error: error.message });
    }
};

// Listar roupas de um guarda-roupa específico
export const getRoupasByGuardaRoupa = async (req, res) => {
    try {
        const { guardaRoupaId } = req.params;

        // Verifica permissão (se o guarda roupa é do usuario)
        const checkDono = await GuardaRoupa.findOne({ _id: guardaRoupaId, usuario: req.user._id });
        if (!checkDono) {
            return res.status(403).json({ message: 'Acesso negado a este guarda-roupa' });
        }

        const roupas = await Roupa.find({ guardaRoupa: guardaRoupaId });
        res.status(200).json(roupas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar roupas', error: error.message });
    }
};

export const updateRoupa = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizacao = req.body;

        // Encontra e atualiza (new: true retorna o objeto atualizado)
        const roupaAtualizada = await Roupa.findByIdAndUpdate(id, dadosAtualizacao, { new: true });

        if (!roupaAtualizada) {
            return res.status(404).json({ message: 'Roupa não encontrada' });
        }

        res.status(200).json(roupaAtualizada);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar roupa', error: error.message });
    }
};

export const deleteRoupa = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Roupa.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Roupa não encontrada' });
        }

        res.status(200).json({ message: 'Roupa removida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar roupa', error: error.message });
    }
};