import GuardaRoupa from '../models/GuardaRoupa.js'; // Ajuste o caminho conforme sua estrutura
import { uploadImage, deleteImage } from '../services/cloudinary.js';

export const createGuardaRoupa = async (req, res) => {
    try {
        const { nome, descricao, isPublic } = req.body;
        const usuarioId = req.user._id;

        // Converte isPublic de string "true"/"false" para boolean se necessário
        const isPublicBoolean = isPublic === 'true' || isPublic === true || false;

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
            fotoPublicId: fotoPublicId,
            isPublic: isPublicBoolean
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
        console.log(`📚 [getGuardaRoupas] Buscando guarda-roupas do usuário: ${usuarioId}`);

        // Busca apenas os guarda-roupas deste usuário
        const guardaRoupas = await GuardaRoupa.find({ usuario: usuarioId });

        console.log(`✅ [getGuardaRoupas] ${guardaRoupas.length} guarda-roupas encontrados`);
        res.status(200).json(guardaRoupas);
    } catch (error) {
        console.error('❌ [getGuardaRoupas] Erro:', error);
        res.status(500).json({ message: 'Erro ao buscar guarda-roupas', error: error.message });
    }
};

export const getGuardaRoupasPublicos = async (req, res) => {
    try {
        // Busca todos os guarda-roupas públicos (de qualquer usuário)
        const guardaRoupasPublicos = await GuardaRoupa.find({ isPublic: true })
            .populate('usuario', 'nome foto'); // Traz nome e foto do dono

        res.status(200).json(guardaRoupasPublicos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar guarda-roupas públicos', error: error.message });
    }
};

export const getGuardaRoupaById = async (req, res) => {
    try {
        const { id } = req.params;

        const guardaRoupa = await GuardaRoupa.findById(id).populate('usuario', 'nome foto');

        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        // Verifica se o usuário é proprietário
        const usuarioIdString = guardaRoupa.usuario._id ? guardaRoupa.usuario._id.toString() : guardaRoupa.usuario;
        const isOwner = usuarioIdString === req.user._id.toString();
        const isPublic = guardaRoupa.isPublic || false;

        // Permite ver se é do usuário OU se é público
        if (!isOwner && !isPublic) {
            return res.status(403).json({ message: 'Acesso negado: este guarda-roupa é privado' });
        }

        // Retorna o guarda-roupa com flag isOwner para o frontend
        const response = guardaRoupa.toObject();
        response.isOwner = isOwner;

        res.status(200).json(response);
    } catch (error) {
        console.error('Erro ao buscar guarda-roupa:', error);
        res.status(500).json({ message: 'Erro ao buscar detalhes', error: error.message });
    }
};
// --- NOVO: UPDATE ---
export const updateGuardaRoupa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, isPublic } = req.body;
        const usuarioId = req.user._id;

        // 1. Busca o guarda-roupa para verificar permissão
        const guardaRoupaAtual = await GuardaRoupa.findById(id);

        if (!guardaRoupaAtual) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        // 2. Verifica se o usuário é o proprietário
        if (guardaRoupaAtual.usuario.toString() !== usuarioId.toString()) {
            return res.status(403).json({ message: 'Permissão negada: você não pode editar este guarda-roupa' });
        }

        let updateData = {};

        // Atualiza nome e descricao se fornecidos
        if (nome !== undefined) updateData.nome = nome;
        if (descricao !== undefined) updateData.descricao = descricao;

        // Converte isPublic de string "true"/"false" para boolean se necessário
        if (isPublic !== undefined) {
            updateData.isPublic = isPublic === 'true' || isPublic === true;
        }

        // 3. Se enviou nova foto, processa troca
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

        // 4. Atualiza
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
        const usuarioId = req.user._id;
        console.log("------------------------------------------------");
        console.log("🗑️ [DEBUG] Iniciando DELETE Guarda-Roupa");
        console.log("👉 ID recebido na URL:", id);
        console.log("👤 Usuário solicitante:", req.user ? req.user._id : 'NÃO AUTENTICADO');

        // 1. Busca primeiro para pegar o ID da imagem e verificar proprietário
        const guardaRoupa = await GuardaRoupa.findById(id).select('+fotoPublicId');

        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        // 2. Verifica se o usuário é o proprietário
        if (guardaRoupa.usuario.toString() !== usuarioId.toString()) {
            return res.status(403).json({ message: 'Permissão negada: você não pode deletar este guarda-roupa' });
        }

        // 3. Deleta imagem do Cloudinary
        if (guardaRoupa.fotoPublicId) {
            await deleteImage(guardaRoupa.fotoPublicId);
        }

        // 4. Deleta do banco
        // Nota: O ideal seria deletar também as ROUPAS filhas aqui (cascade delete), 
        // mas para o MVP podemos deixar assim ou adicionar depois.
        await GuardaRoupa.findByIdAndDelete(id);

        res.status(200).json({ message: 'Guarda-roupa deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar', error: error.message });
    }
};