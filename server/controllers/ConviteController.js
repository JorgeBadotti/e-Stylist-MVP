import Convite from '../models/ConviteModel.js';
import Usuario from '../models/UsuarioModel.js';
import Loja from '../models/Loja.js';

// ✅ STORE_ADMIN envia convite para um USER ou SALESPERSON
export const enviarConvite = async (req, res) => {
    try {
        const { lojaId, email, mensagem } = req.body;
        const storeAdminId = req.user._id;

        console.log(`📧 [enviarConvite] STORE_ADMIN ${storeAdminId} tentando convidar ${email} para loja ${lojaId}`);

        // 1. Validar se email existe
        const usuarioInvitado = await Usuario.findOne({ email });
        if (!usuarioInvitado) {
            console.log(`❌ [enviarConvite] Email não encontrado: ${email}`);
            return res.status(404).json({ 
                error: 'Email não encontrado',
                message: 'Este email não está cadastrado no sistema.'
            });
        }

        // 2. Validar se é USER ou SALESPERSON (não pode ser STORE_ADMIN ou SUPER_ADMIN)
        const rolesVendedor = ['USER', 'SALESPERSON'];
        if (!rolesVendedor.includes(usuarioInvitado.role)) {
            console.log(`❌ [enviarConvite] Usuário ${email} tem role ${usuarioInvitado.role} (não permitido)`);
            return res.status(400).json({ 
                error: 'Usuário inválido',
                message: 'Não é permitido convidar administradores ou superadministradores.'
            });
        }

        // 3. Validar se já tem convite pendente da mesma loja
        const convitePendente = await Convite.findOne({
            usuario: usuarioInvitado._id,
            loja: lojaId,
            status: 'pending'
        });
        if (convitePendente) {
            console.log(`❌ [enviarConvite] Convite pendente já existe`);
            return res.status(400).json({ 
                error: 'Convite já enviado',
                message: 'Já existe um convite pendente para este usuário nesta loja.'
            });
        }

        // 4. Validar se já é vendedor dessa loja
        if (usuarioInvitado.lojas_associadas.includes(lojaId)) {
            console.log(`❌ [enviarConvite] Usuário já é vendedor dessa loja`);
            return res.status(400).json({ 
                error: 'Já é vendedor',
                message: 'Este usuário já é vendedor desta loja.'
            });
        }

        // 5. Criar convite
        const novoConvite = new Convite({
            usuario: usuarioInvitado._id,
            loja: lojaId,
            email: usuarioInvitado.email,
            mensagem: mensagem || ''
        });

        await novoConvite.save();
        console.log(`✅ [enviarConvite] Convite criado: ${novoConvite._id}`);

        // TODO: Enviar notificação/email para o usuário convidado

        res.status(201).json({
            message: 'Convite enviado com sucesso',
            convite: {
                id: novoConvite._id,
                email: novoConvite.email,
                status: novoConvite.status,
                criadoEm: novoConvite.criadoEm
            }
        });
    } catch (error) {
        console.error('❌ [enviarConvite] Erro:', error);
        res.status(500).json({ error: 'Erro ao enviar convite.' });
    }
};

// ✅ Listar meus convites pendentes
export const minhasInvitacoes = async (req, res) => {
    try {
        const usuarioId = req.user._id;

        console.log(`👥 [minhasInvitacoes] Buscando convites do usuário ${usuarioId}`);

        const convites = await Convite.find({ usuario: usuarioId, status: 'pending' })
            .populate('usuario', 'nome email')
            .populate('loja', 'nome logo')
            .lean();

        console.log(`✅ [minhasInvitacoes] ${convites.length} convites encontrados`);

        res.status(200).json({
            convites: convites.map(c => ({
                _id: c._id,
                usuario: c.usuario,
                loja: c.loja,
                mensagem: c.mensagem,
                criadoEm: c.criadoEm
            }))
        });
    } catch (error) {
        console.error('❌ [minhasInvitacoes] Erro:', error);
        res.status(500).json({ error: 'Erro ao buscar convites.' });
    }
};

// ✅ Aceitar convite
export const aceitarConvite = async (req, res) => {
    try {
        const { conviteId } = req.params;
        const usuarioId = req.user._id;

        console.log(`✅ [aceitarConvite] Usuário ${usuarioId} aceitando convite ${conviteId}`);

        const convite = await Convite.findById(conviteId);
        if (!convite) {
            console.log(`❌ [aceitarConvite] Convite não encontrado`);
            return res.status(404).json({ error: 'Convite não encontrado.' });
        }

        if (convite.usuario.toString() !== usuarioId.toString()) {
            console.log(`❌ [aceitarConvite] Usuário não autorizado`);
            return res.status(403).json({ error: 'Você não pode aceitar este convite.' });
        }

        if (convite.status !== 'pending') {
            console.log(`❌ [aceitarConvite] Convite já foi respondido (${convite.status})`);
            return res.status(400).json({ error: 'Este convite já foi respondido.' });
        }

        // Atualizar status do convite
        convite.status = 'accepted';
        convite.respondidoEm = new Date();
        await convite.save();

        // Adicionar loja ao array de lojas_associadas do usuário
        await Usuario.findByIdAndUpdate(
            usuarioId,
            { 
                $addToSet: { lojas_associadas: convite.loja }, // $addToSet evita duplicatas
                $set: { role: 'SALESPERSON' } // Atualizar role para SALESPERSON se ainda for USER
            },
            { new: true }
        );

        console.log(`✅ [aceitarConvite] Convite aceito, usuário agora vendedor`);

        res.status(200).json({
            message: 'Convite aceito com sucesso! Você agora é vendedor desta loja.',
            convite: {
                id: convite._id,
                status: convite.status
            }
        });
    } catch (error) {
        console.error('❌ [aceitarConvite] Erro:', error);
        res.status(500).json({ error: 'Erro ao aceitar convite.' });
    }
};

// ✅ Rejeitar convite
export const rejeitarConvite = async (req, res) => {
    try {
        const { conviteId } = req.params;
        const usuarioId = req.user._id;

        console.log(`❌ [rejeitarConvite] Usuário ${usuarioId} rejeitando convite ${conviteId}`);

        const convite = await Convite.findById(conviteId);
        if (!convite) {
            console.log(`❌ [rejeitarConvite] Convite não encontrado`);
            return res.status(404).json({ error: 'Convite não encontrado.' });
        }

        if (convite.usuario.toString() !== usuarioId.toString()) {
            console.log(`❌ [rejeitarConvite] Usuário não autorizado`);
            return res.status(403).json({ error: 'Você não pode rejeitar este convite.' });
        }

        if (convite.status !== 'pending') {
            console.log(`❌ [rejeitarConvite] Convite já foi respondido (${convite.status})`);
            return res.status(400).json({ error: 'Este convite já foi respondido.' });
        }

        // Atualizar status do convite
        convite.status = 'rejected';
        convite.respondidoEm = new Date();
        await convite.save();

        console.log(`✅ [rejeitarConvite] Convite rejeitado`);

        res.status(200).json({
            message: 'Convite rejeitado.',
            convite: {
                id: convite._id,
                status: convite.status
            }
        });
    } catch (error) {
        console.error('❌ [rejeitarConvite] Erro:', error);
        res.status(500).json({ error: 'Erro ao rejeitar convite.' });
    }
};

// ✅ Listar vendedores de uma loja (apenas STORE_ADMIN da loja)
export const listarVendedoresLoja = async (req, res) => {
    try {
        const { lojaId } = req.params;
        const storeAdminId = req.user._id;

        console.log(`👥 [listarVendedoresLoja] Buscando vendedores da loja ${lojaId}`);

        // Validar se o usuário é STORE_ADMIN dessa loja
        const loja = await Loja.findById(lojaId);
        if (!loja || loja.usuario.toString() !== storeAdminId.toString()) {
            console.log(`❌ [listarVendedoresLoja] Usuário não autorizado`);
            return res.status(403).json({ error: 'Você não tem permissão para ver os vendedores desta loja.' });
        }

        // Buscar vendedores (usuários que têm essa loja em lojas_associadas)
        const vendedores = await Usuario.find(
            { lojas_associadas: lojaId },
            'nome email role lojas_associadas'
        ).lean();

        console.log(`✅ [listarVendedoresLoja] ${vendedores.length} vendedores encontrados`);

        res.status(200).json({
            vendedores: vendedores.map(v => ({
                id: v._id,
                nome: v.nome,
                email: v.email,
                role: v.role,
                lojas: v.lojas_associadas.length
            }))
        });
    } catch (error) {
        console.error('❌ [listarVendedoresLoja] Erro:', error);
        res.status(500).json({ error: 'Erro ao listar vendedores.' });
    }
};

// ✅ Listar convites pendentes de uma loja (apenas STORE_ADMIN da loja)
export const listarConvitesPendentes = async (req, res) => {
    try {
        const { lojaId } = req.params;
        const storeAdminId = req.user._id;

        console.log(`📧 [listarConvitesPendentes] Buscando convites pendentes da loja ${lojaId}`);

        // Validar se o usuário é STORE_ADMIN dessa loja
        const loja = await Loja.findById(lojaId);
        if (!loja || loja.usuario.toString() !== storeAdminId.toString()) {
            console.log(`❌ [listarConvitesPendentes] Usuário não autorizado`);
            return res.status(403).json({ error: 'Você não tem permissão para ver os convites desta loja.' });
        }

        // Buscar convites pendentes
        const convites = await Convite.find(
            { loja: lojaId, status: 'pending' },
            'usuario email mensagem criadoEm'
        ).populate('usuario', 'nome email role').lean();

        console.log(`✅ [listarConvitesPendentes] ${convites.length} convites pendentes`);

        res.status(200).json({
            convites: convites.map(c => ({
                id: c._id,
                email: c.email,
                usuario: {
                    id: c.usuario._id,
                    nome: c.usuario.nome,
                    role: c.usuario.role
                },
                mensagem: c.mensagem,
                criadoEm: c.criadoEm
            }))
        });
    } catch (error) {
        console.error('❌ [listarConvitesPendentes] Erro:', error);
        res.status(500).json({ error: 'Erro ao listar convites.' });
    }
};
