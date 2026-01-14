import Usuario from '../models/UsuarioModel.js';
import Loja from '../models/Loja.js';

/**
 * Registra um novo usuário com a role 'STORE' e cria uma loja associada.
 */
export const registerStore = async (req, res) => {
    const { nome, email, password, telefone, cnpj } = req.body;

    // 1. Validação básica dos campos obrigatórios
    if (!nome || !email || !password || !telefone || !cnpj) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: Nome, E-mail, Senha, Telefone e CNPJ.' });
    }

    try {
        // 2. Verifica se o usuário ou CNPJ já existem
        const userExists = await Usuario.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }

        const cnpjExists = await Loja.findOne({ cnpj });
        if (cnpjExists) {
            return res.status(409).json({ message: 'Este CNPJ já está cadastrado.' });
        }

        // 3. Cria o novo usuário com a role STORE
        const novoUsuario = new Usuario({
            email,
            role: 'STORE'
        });

        // O método 'register' do passport-local-mongoose cuida do hash da senha
        Usuario.register(novoUsuario, password, async (err, usuario) => {
            if (err) {
                console.error('Erro ao registrar usuário:', err);
                return res.status(500).json({ message: 'Erro interno ao criar o usuário.', error: err.message });
            }

            try {
                // 4. Cria a loja associada ao novo usuário
                const novaLoja = await Loja.create({
                    nome,
                    cnpj,
                    telefone,
                    usuario: usuario._id // Associa a loja ao usuário recém-criado
                });

                // 5. Retorna sucesso com os dados criados (sem a senha)
                res.status(201).json({
                    message: 'Lojista cadastrado com sucesso!',
                    usuario: {
                        id: usuario._id,
                        email: usuario.email,
                        role: usuario.role
                    },
                    loja: novaLoja
                });
            } catch (lojaErr) {
                console.error('Erro ao criar loja:', lojaErr);
                // Se a criação da loja falhar, remove o usuário criado para evitar inconsistência
                await Usuario.findByIdAndDelete(usuario._id);
                res.status(500).json({ message: 'Erro interno ao criar a loja.', error: lojaErr.message });
            }
        });

    } catch (error) {
        console.error('Erro no processo de cadastro de lojista:', error);
        res.status(500).json({ message: 'Ocorreu um erro inesperado.', error: error.message });
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
