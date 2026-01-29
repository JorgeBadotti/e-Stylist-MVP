/**
 * Constrói o payload para salvar dados do perfil no servidor
 */

interface FormData {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    sexo?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    altura_cm?: number;
    estilo_pessoal?: string;
    medidas: {
        busto: number;
        cintura: number;
        quadril: number;
        altura: number;
        pescoco?: number;
        ombro?: number;
        braco?: number;
        antebraco?: number;
        pulso?: number;
        torax?: number;
        sobpeito?: number;
        costelas?: number;
        panturrilha?: number;
        coxa?: number;
        tornozelo?: number;
        comprimento_torso?: number;
        comprimento_perna?: number;
        comprimento_braco?: number;
    };
    proporcoes?: {
        pernas?: string;
        torso?: string;
        ombros_vs_quadril?: string;
        confidence?: number;
    };
}

interface MedidasPayload {
    busto: number;
    cintura: number;
    quadril: number;
    altura: number;
    pescoco?: number;
    ombro?: number;
    braco?: number;
    antebraco?: number;
    pulso?: number;
    torax?: number;
    sobpeito?: number;
    costelas?: number;
    panturrilha?: number;
    coxa?: number;
    tornozelo?: number;
    comprimento_torso?: number;
    comprimento_perna?: number;
    comprimento_braco?: number;
}

interface ProporcoesPayload {
    pernas?: string;
    torso?: string;
    ombros_vs_quadril?: string;
    confidence?: number;
}

export interface PayloadPerfil {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    sexo?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    estilo_pessoal?: string;
    medidas: MedidasPayload;
    proporcoes: ProporcoesPayload;
}

/**
 * Constrói o payload completo para salvar perfil
 */
export const buildProfilePayload = (formData: FormData): PayloadPerfil => {
    return {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpf: formData.cpf,
        sexo: formData.sexo,
        foto_corpo: formData.foto_corpo,
        tipo_corpo: formData.tipo_corpo,
        estilo_pessoal: formData.estilo_pessoal,
        medidas: {
            busto: formData.medidas.busto,
            cintura: formData.medidas.cintura,
            quadril: formData.medidas.quadril,
            altura: formData.medidas.altura,
            pescoco: formData.medidas.pescoco,
            ombro: formData.medidas.ombro,
            braco: formData.medidas.braco,
            antebraco: formData.medidas.antebraco,
            pulso: formData.medidas.pulso,
            torax: formData.medidas.torax,
            sobpeito: formData.medidas.sobpeito,
            costelas: formData.medidas.costelas,
            panturrilha: formData.medidas.panturrilha,
            coxa: formData.medidas.coxa,
            tornozelo: formData.medidas.tornozelo,
            comprimento_torso: formData.medidas.comprimento_torso,
            comprimento_perna: formData.medidas.comprimento_perna,
            comprimento_braco: formData.medidas.comprimento_braco
        },
        proporcoes: {
            pernas: formData.proporcoes?.pernas,
            torso: formData.proporcoes?.torso,
            ombros_vs_quadril: formData.proporcoes?.ombros_vs_quadril,
            confidence: formData.proporcoes?.confidence
        }
    };
};
