import GuardaRoupa from '../models/GuardaRoupa.js'; // Ajuste o caminho conforme sua estrutura
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const createGuardaRoupa = async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        const usuarioId = req.user._id;

        let fotoUrl = '';
        let fotoPublicId = '';

        // SE TIVER ARQUIVO, FAZ O UPLOAD
        if (req.file) {
            // 'guarda-roupas' é a pasta dentro do Cloudinary
            const result = await uploadImage(req.file.buffer, 'guarda-roupas');
            fotoUrl = result.secure_url;
            fotoPublicId = result.public_id;
        }

        const novoGuardaRoupa = await GuardaRoupa.create({
            nome,
            descricao,
            usuario: usuarioId,
            foto: fotoUrl,
            fotoPublicId: fotoPublicId
        });

        res.status(201).json(novoGuardaRoupa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar guarda-roupa', error: error.message });
    }
};

export const getGuardaRoupas = async (req, res) => {
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
// --- NOVO: UPDATE ---
export const updateGuardaRoupa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        // 1. Busca o guarda-roupa para verificar dono e pegar ID da foto antiga
        const guardaRoupaAtual = await GuardaRoupa.findOne({ _id: id, usuario: req.user._id }).select('+fotoPublicId');

        if (!guardaRoupaAtual) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado ou permissão negada' });
        }

        let updateData = { nome, descricao };

        // 2. Se enviou nova foto, processa troca
        if (req.file) {
            try {
                // Deleta antiga se existir
                if (guardaRoupaAtual.fotoPublicId) {
                    await deleteImage(guardaRoupaAtual.fotoPublicId);
                }
                // Sobe nova
                const result = await uploadImage(req.file.buffer, 'guarda-roupas');
                updateData.foto = result.secure_url;
                updateData.fotoPublicId = result.public_id;
            } catch (err) {
                console.error("Erro na troca de imagem:", err);
                return res.status(500).json({ message: 'Erro ao processar imagem' });
            }
        }

        // 3. Atualiza
        const atualizado = await GuardaRoupa.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(atualizado);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar guarda-roupa', error: error.message });
    }
};

// --- ATUALIZADO: DELETE COM REMOÇÃO DE IMAGEM ---
export const deleteGuardaRoupa = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("------------------------------------------------");
        console.log("🗑️ [DEBUG] Iniciando DELETE Guarda-Roupa");
        console.log("👉 ID recebido na URL:", id);
        console.log("👤 Usuário solicitante:", req.user ? req.user._id : 'NÃO AUTENTICADO');

        // 1. Busca primeiro para pegar o ID da imagem
        const guardaRoupa = await GuardaRoupa.findOne({ _id: id, usuario: req.user._id }).select('+fotoPublicId');

        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        // 2. Deleta imagem do Cloudinary
        if (guardaRoupa.fotoPublicId) {
            await deleteImage(guardaRoupa.fotoPublicId);
        }

        // 3. Deleta do banco
        // Nota: O ideal seria deletar também as ROUPAS filhas aqui (cascade delete), 
        // mas para o MVP podemos deixar assim ou adicionar depois.
        await GuardaRoupa.findByIdAndDelete(id);

        res.status(200).json({ message: 'Guarda-roupa deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar', error: error.message });
    }
};