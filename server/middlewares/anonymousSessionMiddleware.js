import { obterOuCriarAnonimoUsuario, gerarSessionId } from '../services/anonymousSessionService.js';

/**
 * Middleware para gerenciar sessões anônimas
 * Cria ou recupera usuário anônimo baseado no sessionId do cliente
 */
export const anonymousSessionMiddleware = async (req, res, next) => {
    try {
        // 0. ⏭️ PULAR para assets estáticos - não precisam de sessão
        const urlPath = req.path;
        if (
            urlPath.startsWith('/assets/') ||
            urlPath.startsWith('/public/') ||
            urlPath === '/favicon.ico' ||
            urlPath === '/manifest.webmanifest' ||
            urlPath === '/sw.js' ||
            urlPath.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
        ) {
            console.log(`⏭️  [AnonymousSession] Asset estático, pulando middleware: ${urlPath}`);
            return next();
        }

        // 1. Se usuário já está autenticado, pular middleware
        if (req.user) {
            console.log(`⏭️  [AnonymousSession] Usuário autenticado detectado, pulando middleware`);
            return next();
        }

        // 2. Tentar obter sessionId do header ou criar novo
        let sessionId = req.headers['x-session-id'];

        if (!sessionId) {
            // Gerar novo sessionId se não existe
            sessionId = gerarSessionId();
            console.log(`✨ [AnonymousSession] Novo sessionId gerado: ${sessionId}`);
        } else {
            console.log(`📍 [AnonymousSession] SessionId recebido no header: ${sessionId}`);
        }

        // 3. Obter ou criar usuário anônimo
        const usuarioAnonimo = await obterOuCriarAnonimoUsuario(sessionId);

        // 4. Simular autenticação (similar a req.user, mas para anônimo)
        req.user = usuarioAnonimo;
        req.user._id = usuarioAnonimo._id;
        req.sessionId = sessionId;
        req.isAnonymousUser = true;

        // 5. Retornar sessionId no header para cliente armazenar
        res.setHeader('X-Session-Id', sessionId);
        console.log(`📤 [AnonymousSession] Header X-Session-Id retornado: ${sessionId}`);

        console.log(`✅ [AnonymousSession] Middleware executado - Usuario: ${usuarioAnonimo._id}`);

        next();
    } catch (error) {
        console.error('❌ [AnonymousSession] Erro no middleware:', error.message);
        // Não bloquear a requisição se falhar - permitir acesso anônimo mesmo assim
        next();
    }
};

export default anonymousSessionMiddleware;
