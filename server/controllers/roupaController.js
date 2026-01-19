import Produto from '../models/Produto.js';
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

        // 4. Cria o produto com os dados da imagem
        const novoProduto = await Produto.create({
            nome,
            categoria,
            cor,
            tamanho,
            tecido,
            guardaRoupaId: guardaRoupaId,
            foto: fotoUrl,          // Salva a URL
            fotoPublicId: fotoPublicId // Salva o ID para poder deletar depois
        });

        res.status(201).json(novoProduto);
    } catch (error) {
        console.error(error); // Bom para debugar
        res.status(500).json({ message: 'Erro ao adicionar roupa', error: error.message });
    }
};

export const getRoupasByGuardaRoupa = async (req, res) => {
    try {
        const { guardaRoupaId } = req.params;

        // Busca o guardaroupa
        const guardaRoupa = await GuardaRoupa.findById(guardaRoupaId);

        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        // Verifica permissão: é o dono OU é público
        const isOwner = guardaRoupa.usuario.toString() === req.user._id.toString();
        const isPublic = guardaRoupa.isPublic || false;

        if (!isOwner && !isPublic) {
            return res.status(403).json({ message: 'Acesso negado: este guarda-roupa é privado' });
        }

        const produtos = await Produto.find({ guardaRoupaId: guardaRoupaId });
        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar roupas', error: error.message });
    }
};

export const updateRoupa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, categoria, cor, tamanho, tecido } = req.body;
        const usuarioId = req.user._id;

        // 1. Buscar o produto atual (precisamos do publicId antigo caso haja troca de foto)
        const produtoAtual = await Produto.findById(id).select('+fotoPublicId');

        if (!produtoAtual) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // 2. Verificar se o usuário é dono do guardaroupa
        const guardaRoupa = await GuardaRoupa.findById(produtoAtual.guardaRoupaId);
        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        if (guardaRoupa.usuario.toString() !== usuarioId.toString()) {
            return res.status(403).json({ message: 'Permissão negada: você não pode editar produtos deste guarda-roupa' });
        }

        let updateData = { nome, categoria, cor, tamanho, tecido };

        // 3. Verifica se veio uma NOVA imagem
        if (req.file) {
            try {
                // A. Deleta a imagem antiga do Cloudinary (se existir)
                if (produtoAtual.fotoPublicId) {
                    await deleteImage(produtoAtual.fotoPublicId);
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

        // 4. Atualiza no Banco
        const produtoAtualizado = await Produto.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json(produtoAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar roupa', error: error.message });
    }
};

export const deleteRoupa = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user._id;

        // 1. Busca para pegar o ID da foto
        const produto = await Produto.findById(id).select('+fotoPublicId');

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // 2. Verificar se o usuário é dono do guardaroupa
        const guardaRoupa = await GuardaRoupa.findById(produto.guardaRoupaId);
        if (!guardaRoupa) {
            return res.status(404).json({ message: 'Guarda-roupa não encontrado' });
        }

        if (guardaRoupa.usuario.toString() !== usuarioId.toString()) {
            return res.status(403).json({ message: 'Permissão negada: você não pode deletar produtos deste guarda-roupa' });
        }

        // 3. Deleta do Cloudinary
        if (produto.fotoPublicId) {
            await deleteImage(produto.fotoPublicId);
        }

        // 4. Deleta do Banco
        await Produto.findByIdAndDelete(id);

        res.status(200).json({ message: 'Produto removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar roupa', error: error.message });
    }
};

/**
 * Atualiza o status e o preço de venda de uma peça de roupa.
 * Permite que o usuário coloque uma peça à venda, a doe ou a reverta para ativa.
 */
export const updateRoupaStatus = async (req, res) => {
    const { id } = req.params;
    const { status, precoVenda } = req.body;
    const userId = req.user._id;

    // Validação básica de entrada
    if (!status || !['ativo', 'venda', 'doado'].includes(status)) {
        return res.status(400).json({ message: "O campo 'status' é obrigatório e deve ser 'ativo', 'venda' ou 'doado'." });
    }

    try {
        // 1. Encontrar o produto e verificar a propriedade
        const produto = await Produto.findById(id).populate('guardaRoupa');

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Garante que o usuário que está atualizando é o dono do guarda-roupa
        if (produto.guardaRoupaId) {
            const guardaRoupa = await GuardaRoupa.findById(produto.guardaRoupaId);
            if (!guardaRoupa || guardaRoupa.usuario.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para alterar este produto.' });
            }
        }

        // 2. Aplicar a lógica de negócio baseada no status
        produto.status = status;

        if (status === 'venda') {
            // Valida se o preço de venda foi fornecido e é um número válido
            const preco = parseFloat(precoVenda);
            if (isNaN(preco) || preco <= 0) {
                return res.status(400).json({ message: 'Para colocar à venda, é necessário fornecer um preço de venda válido e maior que zero.' });
            }
            produto.precoVenda = preco;
        } else {
            // Se o status for 'ativo' ou 'doado', o preço de venda deve ser nulo
            produto.precoVenda = null;
        }

        // 3. Salvar as alterações
        // O middleware pre-save no modelo Produto.js também garantirá a limpeza do precoVenda
        const produtoAtualizado = await produto.save();

        res.status(200).json({ message: `Status do produto atualizado para '${status}'.`, roupa: produtoAtualizado });

    } catch (error) {
        console.error('Erro ao atualizar status da roupa:', error);
        // Trata erros de validação do Mongoose (definidos no schema)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Ocorreu um erro inesperado ao atualizar a peça.', error: error.message });
    }
};