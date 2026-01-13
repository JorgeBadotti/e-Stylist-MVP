// middleware/authMiddleware.js
export const isAuthenticated = (req, res, next) => {
    // O Passport adiciona o método isAuthenticated() ao request
    if (req.isAuthenticated()) {
        return next();
    }
    // Se não estiver logado, retorna 401 (Não autorizado)
    return res.status(401).json({ message: 'Você precisa estar logado para acessar este recurso.' });
};