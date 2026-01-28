/**
 * Mapeia dados do backend para o formulário de perfil
 */

import { UserProfileData, Medidas, Proporcoes } from '../types';

interface BackendUser {
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
    sexo?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    altura_cm?: number;
    estilo_pessoal?: string;
    medidas?: Partial<Medidas>;
    proporcoes?: Partial<Proporcoes>;
}

/**
 * Mapeia dados do backend para formulário com valores padrão
 */
export const mapBackendToFormData = (user: BackendUser): UserProfileData => {
    return {
        nome: user.nome || '',
        email: user.email || '',
        cpf: user.cpf || '',
        telefone: user.telefone || '',
        sexo: user.sexo || '',
        foto_corpo: user.foto_corpo || '',
        tipo_corpo: user.tipo_corpo || '',
        altura_cm: user.altura_cm || 0,
        estilo_pessoal: user.estilo_pessoal || '',
        medidas: {
            busto: user.medidas?.busto || 0,
            cintura: user.medidas?.cintura || 0,
            quadril: user.medidas?.quadril || 0,
            altura: user.medidas?.altura || 0,
            pescoco: user.medidas?.pescoco || 0,
            ombro: user.medidas?.ombro || 0,
            braco: user.medidas?.braco || 0,
            antebraco: user.medidas?.antebraco || 0,
            pulso: user.medidas?.pulso || 0,
            torax: user.medidas?.torax || 0,
            sobpeito: user.medidas?.sobpeito || 0,
            costelas: user.medidas?.costelas || 0,
            panturrilha: user.medidas?.panturrilha || 0,
            coxa: user.medidas?.coxa || 0,
            tornozelo: user.medidas?.tornozelo || 0,
            comprimento_torso: user.medidas?.comprimento_torso || 0,
            comprimento_perna: user.medidas?.comprimento_perna || 0,
            comprimento_braco: user.medidas?.comprimento_braco || 0
        },
        proporcoes: {
            pernas: user.proporcoes?.pernas || '',
            torso: user.proporcoes?.torso || '',
            ombros_vs_quadril: user.proporcoes?.ombros_vs_quadril || '',
            confidence: user.proporcoes?.confidence || 0
        }
    };
};

/**
 * Mapeia dados da análise de foto para formulário
 */
export const mapAnalyzeBodyToFormData = (
    analise: any,
    prevData: UserProfileData
): Partial<UserProfileData> => {
    return {
        sexo: analise.sexo || prevData.sexo,
        altura_cm: analise.altura_estimada_cm || prevData.altura_cm,
        tipo_corpo: analise.tipo_corpo || prevData.tipo_corpo,
        medidas: {
            ...prevData.medidas,
            // Medidas básicas
            busto: analise.medidas?.busto || prevData.medidas.busto,
            cintura: analise.medidas?.cintura || prevData.medidas.cintura,
            quadril: analise.medidas?.quadril || prevData.medidas.quadril,
            altura: analise.medidas?.altura || prevData.medidas.altura,
            // Medidas superiores
            pescoco: analise.medidas?.pescoco || prevData.medidas.pescoco || 0,
            ombro: analise.medidas?.ombro || prevData.medidas.ombro || 0,
            braco: analise.medidas?.braco || prevData.medidas.braco || 0,
            antebraco: analise.medidas?.antebraco || prevData.medidas.antebraco || 0,
            pulso: analise.medidas?.pulso || prevData.medidas.pulso || 0,
            torax: analise.medidas?.torax || prevData.medidas.torax || 0,
            sobpeito: analise.medidas?.sobpeito || prevData.medidas.sobpeito || 0,
            costelas: analise.medidas?.costelas || prevData.medidas.costelas || 0,
            // Medidas inferiores
            coxa: analise.medidas?.coxa || prevData.medidas.coxa || 0,
            panturrilha: analise.medidas?.panturrilha || prevData.medidas.panturrilha || 0,
            tornozelo: analise.medidas?.tornozelo || prevData.medidas.tornozelo || 0,
            // Comprimentos
            comprimento_torso: analise.medidas?.comprimento_torso || prevData.medidas.comprimento_torso || 0,
            comprimento_perna: analise.medidas?.comprimento_perna || prevData.medidas.comprimento_perna || 0,
            comprimento_braco: analise.medidas?.comprimento_braco || prevData.medidas.comprimento_braco || 0
        },
        proporcoes: {
            ...prevData.proporcoes,
            pernas: analise.proporcoes?.pernas || prevData.proporcoes?.pernas,
            torso: analise.proporcoes?.torso || prevData.proporcoes?.torso,
            ombros_vs_quadril: analise.proporcoes?.ombros_vs_quadril || prevData.proporcoes?.ombros_vs_quadril,
            confidence: analise.confianca || prevData.proporcoes?.confidence
        }
    };
};
