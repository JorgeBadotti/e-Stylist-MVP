import Produto from '../models/Produto.js';
import GuardaRoupa from '../models/GuardaRoupa.js';
import Loja from '../models/Loja.js';
import { uploadImage, deleteImage } from '../services/cloudinary.js';

/**
 * Criar um novo Produto
 * Pode ser associado a um GuardaRoupa (usuário) ou a uma Loja (store admin)
 */
export const createProduto = async (req, res) => {
    try {
        const { nome, cor, tamanho, material, guardaRoupaId, lojaId, sku } = req.body;
        const usuarioId = req.user._id;

        // Validação: deve ter SKU
        if (!sku) {
            return res.status(400).json({ message: 'SKU é obrigatório' });
        }

        // Validação: deve ter guardaRoupaId OU lojaId (mas não ambos)
        if (!guardaRoupaId && !lojaId) {
            return res.status(400).json({ message: 'Produto deve estar associado a um GuardaRoupa ou Loja' });
        }

        // Se for GuardaRoupa, valida permissão
        if (guardaRoupaId) {
            const donoGuardaRoupa = await GuardaRoupa.findOne({ _id: guardaRoupaId, usuario: usuarioId });
            if (!donoGuardaRoupa) {
                return res.status(403).json({ message: 'GuardaRoupa inválido ou acesso negado' });
            }
        }

        // Se for Loja, valida permissão
        if (lojaId) {
            const donaLoja = await Loja.findOne({ _id: lojaId, usuario: usuarioId });
            if (!donaLoja) {
                return res.status(403).json({ message: 'Loja inválida ou acesso negado' });
            }
        }

        // Upload de imagem
        let fotoUrl = '';
        let fotoPublicId = '';

        if (req.file) {
            try {
                const result = await uploadImage(req.file.buffer, 'produtos');
                fotoUrl = result.secure_url;
                fotoPublicId = result.public_id;
            } catch (uploadError) {
                console.error("Erro no upload:", uploadError);
                return res.status(500).json({ message: 'Erro ao fazer upload da imagem' });
            }
        }

        // Criar produto
        const novoProduto = await Produto.create({
            nome,
            cor,
            tamanho,
            material,
            foto: fotoUrl,
            fotoPublicId: fotoPublicId,
            sku,
            guardaRoupaId: guardaRoupaId || null,
            lojaId: lojaId || null
        });

        res.status(201).json(novoProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
    }
};

/**
 * Obter produtos de um GuardaRoupa
 */
export const getProdutosByGuardaRoupa = async (req, res) => {
    try {
        const { guardaRoupaId } = req.params;

        const guardaRoupa = await GuardaRoupa.findById(guardaRoupaId);

        if (!guardaRoupa) {
            return res.status(404).json({ message: 'GuardaRoupa não encontrado' });
        }

        // Verifica permissão: é o dono OU é público
        const isOwner = guardaRoupa.usuario.toString() === req.user._id.toString();
        const isPublic = guardaRoupa.isPublic || false;

        if (!isOwner && !isPublic) {
            return res.status(403).json({ message: 'Acesso negado: este guarda-roupa é privado' });
        }

        // Busca produtos que pertencem a este guardaRoupa
        const produtos = await Produto.find({ guardaRoupaId });
        
        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar produtos', error: error.message });
    }
};

/**
 * Obter produtos de uma Loja
 */
export const getProdutosByLoja = async (req, res) => {
    try {
        const { lojaId } = req.params;

        const loja = await Loja.findById(lojaId);

        if (!loja) {
            return res.status(404).json({ message: 'Loja não encontrada' });
        }

        // Busca produtos que pertencem a esta loja
        const produtos = await Produto.find({ lojaId });
        
        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar produtos', error: error.message });
    }
};

/**
 * Atualizar um Produto
 */
export const updateProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cor, tamanho, material, sku } = req.body;
        const usuarioId = req.user._id;

        // Buscar produto
        const produtoAtual = await Produto.findById(id).select('+fotoPublicId');

        if (!produtoAtual) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        let updateData = { nome, cor, tamanho, material, sku };

        // Se houver nova imagem
        if (req.file) {
            try {
                if (produtoAtual.fotoPublicId) {
                    await deleteImage(produtoAtual.fotoPublicId);
                }

                const result = await uploadImage(req.file.buffer, 'produtos');
                updateData.foto = result.secure_url;
                updateData.fotoPublicId = result.public_id;
            } catch (error) {
                console.error("Erro ao atualizar imagem:", error);
                return res.status(500).json({ message: 'Erro ao processar nova imagem' });
            }
        }

        // Atualizar
        const produtoAtualizado = await Produto.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json(produtoAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
};

/**
 * Deletar um Produto
 */
export const deleteProduto = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar produto
        const produto = await Produto.findById(id).select('+fotoPublicId');

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Deletar imagem
        if (produto.fotoPublicId) {
            await deleteImage(produto.fotoPublicId);
        }

        // Deletar do banco
        await Produto.findByIdAndDelete(id);

        res.status(200).json({ message: 'Produto removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
    }
};
