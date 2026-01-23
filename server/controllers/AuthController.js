import Usuario from '../models/UsuarioModel.js';
import Look from '../models/LookModel.js';
import { obterOuCriarAnonimoUsuario, gerarSessionId } from '../services/anonymousSessionService.js';

// ✅ NOVO: Função para migrar looks de visitante (sessionId) para usuário logado (userId)
const migrateGuestLooks = async (sessionId, userId) => {
    if (!sessionId || !userId) {
        console.log('[Auth] SessionId ou userId não fornecido, pulando migração');
        return;
    }

    try {
        const result = await Look.updateMany(
            {
                sessionId: sessionId,
                userId: { $in: [null, undefined] } // Apenas looks que ainda não têm userId
            },
            {
                $set: {
                    userId: userId,
                    user_type: 'authenticated' // Atualizar tipo de usuário
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ [Auth] ${result.modifiedCount} looks migrados: sessionId ${sessionId} → userId ${userId}`);
        }
    } catch (error) {
        console.error('❌ [Auth] Erro ao migrar looks:', error.message);
        // Não bloquear o login se migração falhar
    }
};

// ✅ ATUALIZADO: Cadastro com auto-login (igual à loja)
export const register = async (req, res) => {
    try {
        const { email, password, nome } = req.body;
        console.log('👤 [register] Criando usuário:', { email, nome });

        // O método .register vem do plugin passport-local-mongoose
        const novoUsuario = new Usuario({
            email,
            nome: nome || ''
        });

        // Aguarda o registro ser criado
        const usuario = await Usuario.register(novoUsuario, password);
        console.log('✅ [register] Usuário criado:', usuario._id);

        // ✅ NOVO: Auto-login após cadastro (igual ao registerStore)
        req.login(usuario, async (err) => {
            if (err) {
                console.error('❌ [register] Erro ao fazer login:', err);
                return res.status(500).json({ error: 'Erro ao fazer login automático' });
            }

            // ✅ NOVO: Migrar looks de visitante para usuário
            const sessionId = req.sessionId || req.headers['x-session-id'];
            if (sessionId) {
                await migrateGuestLooks(sessionId, usuario._id);
            }

            console.log('🔐 [register] Usuário logado automaticamente');
            res.status(201).json({
                message: 'Usuário criado e logado com sucesso',
                usuario: {
                    id: usuario._id,
                    email: usuario.email,
                    nome: usuario.nome,
                    role: usuario.role
                }
            });
        });
    } catch (error) {
        console.error('❌ [register] Erro:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Sucesso no Login Local
export const loginSuccess = async (req, res) => {
    try {
        // ✅ NOVO: Migrar looks de visitante para usuário
        const sessionId = req.sessionId || req.headers['x-session-id'];
        if (sessionId) {
            await migrateGuestLooks(sessionId, req.user._id);
        }

        // Se chegou aqui, req.user já está preenchido pelo Passport
        res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: req.user._id,
                email: req.user.email,
                nome: req.user.nome,
                role: req.user.role // <<< ADICIONADO
            }
        });
    } catch (error) {
        console.error('❌ [loginSuccess] Erro na migração de looks:', error.message);
        // Mesmo com erro, permitir login prosseguir
        res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: req.user._id,
                email: req.user.email,
                nome: req.user.nome,
                role: req.user.role
            }
        });
    }
};

// Callback do Google
export const googleCallback = (req, res) => {
    // Redireciona para o frontend após sucesso
    // O cookie de sessão já foi configurado pelo passport
    // Em DEV: localhost:3000 (onde backend tá servindo a app)
    // Em PROD: domínio configurado em FRONTEND_URL
    const frontendUrl = process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000';
    res.redirect(`${frontendUrl}/`);
};

// Logout
export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.status(200).json({ message: 'Logout realizado' });
    });
};

// Login como Visitante (Guest)
export const loginAsGuest = async (req, res) => {
    try {
        // Gerar novo sessionId para o visitante
        const sessionId = gerarSessionId();
        console.log(`✨ [loginAsGuest] Novo sessionId gerado: ${sessionId}`);

        // Obter ou criar usuário anônimo
        const usuarioAnonimo = await obterOuCriarAnonimoUsuario(sessionId);
        console.log(`👤 [loginAsGuest] Usuário visitante criado/obtido: ${usuarioAnonimo._id}`);

        // Fazer login do usuário anônimo usando req.login
        req.login(usuarioAnonimo, (err) => {
            if (err) {
                console.error('❌ [loginAsGuest] Erro ao fazer login do visitante:', err);
                return res.status(500).json({ error: 'Erro ao fazer login como visitante' });
            }

            console.log('🔐 [loginAsGuest] Visitante logado com sucesso');
            res.status(200).json({
                message: 'Login como visitante realizado com sucesso',
                sessionId: sessionId,
                user: {
                    id: usuarioAnonimo._id,
                    email: usuarioAnonimo.email,
                    nome: usuarioAnonimo.nome,
                    role: usuarioAnonimo.role,
                    isGuest: true
                }
            });
        });
    } catch (error) {
        console.error('❌ [loginAsGuest] Erro:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Verificar sessão atual (Para o React persistir o login)
export const me = async (req, res) => {
    // Retorna sempre 200 para evitar cair no catch do frontend
    if (req.isAuthenticated()) {
        try {
            // Se for STORE_ADMIN, busca o lojaId associado
            // Se for SALESPERSON, busca a primeira loja em lojas_associadas
            let lojaId = null;

            if (req.user.role === 'STORE_ADMIN') {
                const Loja = (await import('../models/Loja.js')).default;
                const loja = await Loja.findOne({ usuario: req.user._id });
                lojaId = loja ? loja._id : null;
            } else if (req.user.role === 'SALESPERSON' && req.user.lojas_associadas && req.user.lojas_associadas.length > 0) {
                // ✅ NOVO: Para SALESPERSON, pega a primeira loja associada
                lojaId = req.user.lojas_associadas[0];
            }

            res.json({
                isAuthenticated: true,
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    nome: req.user.nome,
                    foto: req.user.foto,
                    role: req.user.role,
                    lojaId: lojaId // <<< NOVO: Inclui lojaId para STORE_ADMIN e SALESPERSON
                }
            });
        } catch (error) {
            console.error('❌ [me] Erro ao buscar lojaId:', error);
            // Retorna sem lojaId em caso de erro
            res.json({
                isAuthenticated: true,
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    nome: req.user.nome,
                    foto: req.user.foto,
                    role: req.user.role,
                    lojaId: null
                }
            });
        }
    } else {
        // MUDANÇA: Status 200, mas com flag false.
        // Isso impede que interceptors do Axios tentem tratar como erro.
        res.status(200).json({ isAuthenticated: false });
    }
};