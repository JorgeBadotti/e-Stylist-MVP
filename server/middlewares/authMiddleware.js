// middleware/authMiddleware.js
export const isAuthenticated = (req, res, next) => {
    // O Passport adiciona o método isAuthenticated() ao request
    if (req.isAuthenticated()) {
        return next();
    }
    // Se não estiver logado, retorna 401 (Não autorizado)
    return res.status(401).json({ message: 'Você precisa estar logado para acessar este recurso.' });
};

/**
 * Middleware para verificar se o usuário tem a role 'STORE_ADMIN'.
 * Deve ser usado após o middleware 'isAuthenticated'.
 */
export const isStoreAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'STORE_ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Este recurso é restrito a administradores de loja.' });
};