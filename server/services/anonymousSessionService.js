import Usuario from '../models/UsuarioModel.js';
import crypto from 'crypto';

/**
 * Gera um novo sessionId único
 */
export const gerarSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
};

/**
 * Cria ou recupera um usuário anônimo baseado no sessionId
 * 
 * @param {string} sessionId - ID da sessão do cliente
 * @param {number} expiracaoDias - Número de dias até expiração (padrão: 30)
 * @returns {Promise<Object>} Usuário anônimo criado/atualizado
 */
export const obterOuCriarAnonimoUsuario = async (sessionId, expiracaoDias = 30) => {
    try {
        // 1. Tentar buscar usuário anônimo existente
        let usuario = await Usuario.findOne({
            sessionId: sessionId,
            isAnonymous: true
        });

        if (usuario) {
            // Usuário anônimo encontrado, mas verificar se não expirou
            if (usuario.expiresAt && new Date() > usuario.expiresAt) {
                // Expirou, deletar e criar novo
                await Usuario.deleteOne({ _id: usuario._id });
                usuario = null;
            } else {
                // ✅ OTIMIZADO: Renovar apenas se restam poucos dias (< 7 dias)
                const agora = new Date();
                const diasRestantes = Math.floor((usuario.expiresAt - agora) / (1000 * 60 * 60 * 24));

                if (diasRestantes < 7) {
                    // Renovar apenas se expiração é iminente
                    usuario.expiresAt = new Date(Date.now() + expiracaoDias * 24 * 60 * 60 * 1000);
                    await usuario.save();
                    console.log(`🔄 [AnonymousSession] Sessão renovada (${diasRestantes}d restantes): ${usuario._id}`);
                } else {
                    // Sessão ainda válida, não renovar
                    console.log(`✅ [AnonymousSession] Sessão ativa (${diasRestantes}d restantes): ${usuario._id}`);
                }

                return usuario;
            }
        }

        // 2. Se não existe, criar novo usuário anônimo
        const emailTemporario = `anon_${sessionId}@anonymous.local`;
        const nomeTemporario = `Visitante ${new Date().getTime()}`;

        usuario = new Usuario({
            email: emailTemporario,
            nome: nomeTemporario,
            role: 'ANONYMOUS_USER',
            sessionId: sessionId,
            isAnonymous: true,
            expiresAt: new Date(Date.now() + expiracaoDias * 24 * 60 * 60 * 1000),
            origem_cadastro: 'anonymous_session'
        });

        await usuario.save();

        console.log(`✅ [AnonymousSession] Novo usuário anônimo criado: ${usuario._id} com sessionId: ${sessionId}`);

        return usuario;
    } catch (error) {
        console.error('❌ [AnonymousSession] Erro ao obter/criar usuário anônimo:', error.message);
        throw error;
    }
};

/**
 * Limpa usuários anônimos expirados (pode ser chamado por cron job)
 */
export const limparAnonimusExpirados = async () => {
    try {
        const resultado = await Usuario.deleteMany({
            isAnonymous: true,
            expiresAt: { $lt: new Date() }
        });

        console.log(`🧹 [AnonymousSession] ${resultado.deletedCount} usuários anônimos expirados removidos`);

        return resultado.deletedCount;
    } catch (error) {
        console.error('❌ [AnonymousSession] Erro ao limpar anônimos expirados:', error.message);
        throw error;
    }
};

/**
 * Converte usuário anônimo em usuário real (merge de dados)
 * 
 * @param {string} anonUserId - ID do usuário anônimo
 * @param {string} novoUserId - ID do novo usuário autenticado
 * @returns {Promise<Object>} Resultado da migração
 */
export const migrarAnonimoPraReal = async (anonUserId, novoUserId) => {
    try {
        // 1. Buscar usuários
        const anonUser = await Usuario.findById(anonUserId);
        const realUser = await Usuario.findById(novoUserId);

        if (!anonUser || !realUser) {
            throw new Error('Usuário não encontrado');
        }

        // 2. Migrar carrinho
        await migrarCarrinho(anonUserId, novoUserId);

        // 3. Migrar guardaroupa
        await migrarGuardaRoupa(anonUserId, novoUserId);

        // 4. Migrar looks
        await migrarLooks(anonUserId, novoUserId);

        // 5. Deletar usuário anônimo
        await Usuario.deleteOne({ _id: anonUserId });

        console.log(`✅ [AnonymousSession] Usuário anônimo ${anonUserId} migrado para ${novoUserId}`);

        return {
            success: true,
            message: 'Usuário anônimo migrado com sucesso',
            migrouCarrinho: true,
            migrouGuardaRoupa: true,
            migrouLooks: true
        };
    } catch (error) {
        console.error('❌ [AnonymousSession] Erro ao migrar usuário:', error.message);
        throw error;
    }
};

/**
 * Helper: Migra carrinho do anônimo para real
 */
const migrarCarrinho = async (anonUserId, realUserId) => {
    try {
        const Carrinho = require('../models/Carrinho.js').default;
        const resultado = await Carrinho.updateMany(
            { usuario: anonUserId },
            { usuario: realUserId }
        );
        console.log(`  ✅ Carrinho: ${resultado.modifiedCount} documentos atualizados`);
        return resultado;
    } catch (error) {
        console.error('  ⚠️ Erro ao migrar carrinho:', error.message);
        // Não abortar o processo se falhar
        return { modifiedCount: 0 };
    }
};

/**
 * Helper: Migra guardaroupa do anônimo para real
 */
const migrarGuardaRoupa = async (anonUserId, realUserId) => {
    try {
        const GuardaRoupa = require('../models/GuardaRoupa.js').default;
        const resultado = await GuardaRoupa.updateMany(
            { usuario: anonUserId },
            { usuario: realUserId }
        );
        console.log(`  ✅ GuardaRoupa: ${resultado.modifiedCount} documentos atualizados`);
        return resultado;
    } catch (error) {
        console.error('  ⚠️ Erro ao migrar guardaroupa:', error.message);
        return { modifiedCount: 0 };
    }
};

/**
 * Helper: Migra looks do anônimo para real
 */
const migrarLooks = async (anonUserId, realUserId) => {
    try {
        const Look = require('../models/LookModel.js').default;
        const resultado = await Look.updateMany(
            { usuario: anonUserId },
            { usuario: realUserId }
        );
        console.log(`  ✅ Looks: ${resultado.modifiedCount} documentos atualizados`);
        return resultado;
    } catch (error) {
        console.error('  ⚠️ Erro ao migrar looks:', error.message);
        return { modifiedCount: 0 };
    }
};

export default {
    gerarSessionId,
    obterOuCriarAnonimoUsuario,
    limparAnonimusExpirados,
    migrarAnonimoPraReal
};
