import Usuario from '../models/UsuarioModel.js';
import Loja from '../models/Loja.js';
import Produto from '../models/Produto.js';
import { uploadImage } from '../services/cloudinary.js';

/**
 * Registra um novo usuário com a role 'STORE' e cria uma loja associada.
 */
export const registerStore = async (req, res) => {
    const { nome, email, password, telefone, cnpj } = req.body;

    console.log('📝 [registerStore] Recebido:', { nome, email, telefone, cnpj });

    // 1. Validação básica dos campos obrigatórios
    if (!nome || !email || !password || !telefone || !cnpj) {
        console.warn('❌ [registerStore] Campos obrigatórios ausentes');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: Nome, E-mail, Senha, Telefone e CNPJ.' });
    }

    try {
        // 2. Verifica se o usuário ou CNPJ já existem
        const userExists = await Usuario.findOne({ email });
        if (userExists) {
            console.warn('❌ [registerStore] Email já existe:', email);
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }

        const cnpjExists = await Loja.findOne({ cnpj });
        if (cnpjExists) {
            console.warn('❌ [registerStore] CNPJ já existe:', cnpj);
            return res.status(409).json({ message: 'Este CNPJ já está cadastrado.' });
        }

        // 3. Cria o novo usuário com a role STORE_ADMIN
        console.log('👤 [registerStore] Criando usuário...');
        const novoUsuario = new Usuario({
            email,
            role: 'STORE_ADMIN'
        });

        // ✅ USAR AWAIT - passport-local-mongoose retorna Promise
        const usuario = await Usuario.register(novoUsuario, password);
        console.log('✅ [registerStore] Usuário criado:', usuario._id);

        // 4. Cria a loja associada ao novo usuário
        console.log('🏪 [registerStore] Criando loja associada ao usuário:', usuario._id);
        const novaLoja = await Loja.create({
            nome,
            cnpj,
            telefone,
            usuario: usuario._id
        });
        console.log('✅ [registerStore] Loja criada:', novaLoja._id);

        // ✅ Fazer login automático
        console.log('🔐 [registerStore] Fazendo login automático...');
        req.login(usuario, (loginErr) => {
            if (loginErr) {
                console.error('❌ [registerStore] Erro ao fazer login automático:', loginErr);
                return res.status(500).json({ message: 'Usuário criado, mas erro ao fazer login automático.', error: loginErr.message });
            }

            console.log('✅ [registerStore] Login automático realizado!');

            // 5. Retorna sucesso
            res.status(201).json({
                message: 'Lojista cadastrado com sucesso!',
                usuario: {
                    id: usuario._id,
                    email: usuario.email,
                    role: usuario.role,
                    nome: usuario.nome
                },
                loja: novaLoja
            });
        });

    } catch (error) {
        console.error('❌ [registerStore] Erro:', error.message);
        // Se deu erro ao criar loja, deleta o usuário
        if (error.message.includes('loja')) {
            await Usuario.findByIdAndDelete(novoUsuario._id);
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Busca os detalhes de uma loja específica.
 */
export const getLojaById = async (req, res) => {
    try {
        const { id } = req.params;
        // Popula os dados do usuário associado, mas exclui campos sensíveis
        const loja = await Loja.findById(id).populate('usuario', 'id email nome');

        if (!loja) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        res.status(200).json(loja);
    } catch (error) {
        console.error('Erro ao buscar detalhes da loja:', error);
        res.status(500).json({ message: 'Erro ao buscar detalhes da loja.', error: error.message });
    }
};

/**
 * Atualiza as informações de uma loja.
 * Apenas o usuário dono da loja pode atualizá-la.
 */
export const updateLoja = async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, cnpj, endereco, horarios, bio } = req.body;
    const userId = req.user._id;

    try {
        const loja = await Loja.findById(id);

        if (!loja) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        // Verifica se o usuário autenticado é o dono da loja
        if (loja.usuario.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar esta loja.' });
        }

        // Atualiza os campos de texto
        loja.nome = nome || loja.nome;
        loja.telefone = telefone || loja.telefone;
        loja.cnpj = cnpj || loja.cnpj;
        loja.endereco = endereco || loja.endereco;
        loja.horarios = horarios || loja.horarios;
        loja.bio = bio || loja.bio;

        // Lida com o upload de arquivos (logo e fotos)
        if (req.files) {
            // Upload do logo
            if (req.files.logo) {
                const logoFile = req.files.logo[0];
                // Se já existir um logo, pode ser interessante deletar o antigo no Cloudinary
                const result = await uploadImage(logoFile.buffer, 'lojas/logos');
                loja.logo = result.secure_url;
            }
            // Upload de fotos da loja
            if (req.files.fotos) {
                const fotosPromises = req.files.fotos.map(file => uploadImage(file.buffer, 'lojas/fotos'));
                const results = await Promise.all(fotosPromises);
                // Adiciona as novas fotos às existentes
                loja.fotos = loja.fotos.concat(results.map(r => r.secure_url));
            }
        }

        const lojaAtualizada = await loja.save();

        res.status(200).json({ message: 'Loja atualizada com sucesso!', loja: lojaAtualizada });

    } catch (error) {
        console.error('Erro ao atualizar loja:', error);
        res.status(500).json({ message: 'Erro ao atualizar a loja.', error: error.message });
    }
};

/**
 * Adiciona um novo produto ao catálogo de uma loja.
 * Apenas o usuário dono da loja pode adicionar produtos.
 */
export const adicionarProduto = async (req, res) => {
    const { lojaId } = req.params;
    const { nome, descricao, preco, sku, estoque, cor, tamanho, colecao, estilo, tags } = req.body;
    const userId = req.user._id;

    try {
        const loja = await Loja.findById(lojaId);

        if (!loja) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        // Verifica se o usuário autenticado é o dono da loja
        if (loja.usuario.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para adicionar produtos a esta loja.' });
        }

        // Validação de campos obrigatórios
        if (!nome || !sku) {
            return res.status(400).json({ message: 'Campos obrigatórios: nome e SKU.' });
        }

        // Lida com o upload de foto do produto
        let fotoUrl = '';
        let fotoPublicId = '';
        if (req.file) {
            const result = await uploadImage(req.file.buffer, `produtos_loja/${lojaId}`);
            fotoUrl = result.secure_url;
            fotoPublicId = result.public_id;
        }

        const novoProduto = new Produto({
            nome,
            cor,
            tamanho,
            material: colecao, // Mapeando colecao para material
            sku,
            foto: fotoUrl,
            fotoPublicId: fotoPublicId
        });

        await novoProduto.save();

        res.status(201).json({ message: 'Produto adicionado com sucesso!', produto: novoProduto });

    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        // Tratamento de erro de chave duplicada (SKU)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'O SKU informado já existe no catálogo.' });
        }
        res.status(500).json({ message: 'Erro ao adicionar o produto.', error: error.message });
    }
};

/**
 * Lista todos os produtos de uma loja específica.
 */
export const listarProdutosDaLoja = async (req, res) => {
    const { lojaId } = req.params;

    try {
        console.log(`📦 [listarProdutosDaLoja] Buscando produtos da loja: ${lojaId}`);
        
        // Verifica se a loja existe para dar um feedback melhor
        const loja = await Loja.findById(lojaId);
        if (!loja) {
            console.log(`❌ [listarProdutosDaLoja] Loja não encontrada: ${lojaId}`);
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        // Busca todos os produtos com lojaId
        const produtos = await Produto.find({ 
            lojaId: lojaId,
            status: { $ne: 'DESCONTINUADO' }
        })
        .sort({ createdAt: -1 })
        .lean(); // lean() para retornar dados simples (mais rápido)

        console.log(`✅ [listarProdutosDaLoja] ${produtos.length} produtos encontrados`);
        res.status(200).json(produtos);

    } catch (error) {
        console.error('❌ [listarProdutosDaLoja] Erro:', error);
        res.status(500).json({ message: 'Erro ao buscar os produtos.', error: error.message });
    }
};

/**
 * Lista todas as lojas cadastradas.
 */
export const getAllLojas = async (req, res) => {
    try {
        const lojas = await Loja.find({}).populate('usuario', 'email nome');
        res.status(200).json(lojas);
    } catch (error) {
        console.error('Erro ao listar todas as lojas:', error);
        res.status(500).json({ message: 'Erro ao buscar as lojas.', error: error.message });
    }
};
