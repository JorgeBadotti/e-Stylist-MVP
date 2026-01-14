import Roupa from '../models/Roupa.js';
import GuardaRoupa from '../models/GuardaRoupa.js';

// 1. Importar as funções do utilitário
import { uploadImage, deleteImage } from '../services/cloudinary.js';

export const addRoupa = async (req, res) => {
    try {
        // Nota: Removemos 'foto' daqui, pois ela vem via req.file, não req.body
        const { nome, categoria, cor, tamanho, tecido, guardaRoupaId } = req.body;

        // Validação de segurança
        const donoGuardaRoupa = await GuardaRoupa.findOne({ _id: guardaRoupaId, usuario: req.user._id });
        if (!donoGuardaRoupa) {
            return res.status(403).json({ message: 'Guarda-roupa inválido ou acesso negado' });
        }

        // 2. Variáveis para a imagem
        let fotoUrl = '';
        let fotoPublicId = '';

        // 3. Se houver arquivo (processado pelo Multer), faz o upload
        if (req.file) {
            try {
                // 'roupas' é a pasta dentro do Cloudinary
                const result = await uploadImage(req.file.buffer, 'roupas');
                fotoUrl = result.secure_url;
                fotoPublicId = result.public_id;
            } catch (uploadError) {
                console.error("Erro no upload:", uploadError);
                return res.status(500).json({ message: 'Erro ao fazer upload da imagem' });
            }
        }

        // 4. Cria a roupa com os dados da imagem
        const novaRoupa = await Roupa.create({
            nome,
            categoria,
            cor,
            tamanho,
            tecido,
            guardaRoupa: guardaRoupaId,
            foto: fotoUrl,          // Salva a URL
            fotoPublicId: fotoPublicId // Salva o ID para poder deletar depois
        });

        res.status(201).json(novaRoupa);
    } catch (error) {
        console.error(error); // Bom para debugar
        res.status(500).json({ message: 'Erro ao adicionar roupa', error: error.message });
    }
};

export const getRoupasByGuardaRoupa = async (req, res) => {
    try {
        const { guardaRoupaId } = req.params;

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
        const { nome, categoria, cor, tamanho, tecido } = req.body;

        // 1. Buscar a roupa atual (precisamos do publicId antigo caso haja troca de foto)
        const roupaAtual = await Roupa.findById(id).select('+fotoPublicId');

        if (!roupaAtual) {
            return res.status(404).json({ message: 'Roupa não encontrada' });
        }

        let updateData = { nome, categoria, cor, tamanho, tecido };

        // 2. Verifica se veio uma NOVA imagem
        if (req.file) {
            try {
                // A. Deleta a imagem antiga do Cloudinary (se existir)
                if (roupaAtual.fotoPublicId) {
                    await deleteImage(roupaAtual.fotoPublicId);
                }

                // B. Upload da nova imagem
                const result = await uploadImage(req.file.buffer, 'roupas');

                // C. Adiciona URLs aos dados de atualização
                updateData.foto = result.secure_url;
                updateData.fotoPublicId = result.public_id;
            } catch (error) {
                console.error("Erro ao atualizar imagem:", error);
                return res.status(500).json({ message: 'Erro ao processar nova imagem' });
            }
        }

        // 3. Atualiza no Banco
        const roupaAtualizada = await Roupa.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json(roupaAtualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar roupa', error: error.message });
    }
};

export const deleteRoupa = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Busca para pegar o ID da foto
        const roupa = await Roupa.findById(id).select('+fotoPublicId');

        if (!roupa) {
            return res.status(404).json({ message: 'Roupa não encontrada' });
        }

        // 2. Deleta do Cloudinary
        if (roupa.fotoPublicId) {
            await deleteImage(roupa.fotoPublicId);
        }

        // 3. Deleta do Banco
        await Roupa.findByIdAndDelete(id);

        res.status(200).json({ message: 'Roupa removida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar roupa', error: error.message });
    }
};