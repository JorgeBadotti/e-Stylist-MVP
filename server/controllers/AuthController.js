import Usuario from '../models/UsuarioModel.js';

// Cadastro Local simples
export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // O método .register vem do plugin passport-local-mongoose
        const newUser = new Usuario({ email });
        await Usuario.register(newUser, password);
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Sucesso no Login Local
export const loginSuccess = (req, res) => {
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

// Verificar sessão atual (Para o React persistir o login)
export const me = (req, res) => {
    // Retorna sempre 200 para evitar cair no catch do frontend
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                nome: req.user.nome,
                foto: req.user.foto,
                role: req.user.role // <<< ADICIONADO
            }
        });
    } else {
        // MUDANÇA: Status 200, mas com flag false.
        // Isso impede que interceptors do Axios tentem tratar como erro.
        res.status(200).json({ isAuthenticated: false });
    }
};