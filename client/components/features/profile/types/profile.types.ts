/**
 * Profile Types
 * Tipos compartilhados para o módulo de perfil do usuário
 */

export interface Medidas {
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

export interface Proporcoes {
    pernas?: string;
    torso?: string;
    ombros_vs_quadril?: string;
    confidence?: number;
}

export interface UserProfileData {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    sexo?: string;
    foto?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    altura_cm?: number;
    estilo_pessoal?: string;
    medidas: Medidas;
    proporcoes?: Proporcoes;
}

export interface AnaliseData {
    confianca: number;
    descricao: string;
    [key: string]: any;
}

export interface Message {
    type: 'success' | 'error';
    text: string;
}

export interface ProfilePayload {
    nome?: string;
    email?: string;
    cpf?: string;
    sexo?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    altura_cm?: number;
    estilo_pessoal?: string;
    medidas?: Medidas;
    proporcoes?: Proporcoes;
}
