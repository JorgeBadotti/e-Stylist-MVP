import { useState } from 'react';
import api from '../../../../src/services/api';
import { UserProfileData, AnaliseData } from '../types';
import { mapAnalyzeBodyToFormData } from '../utils/profileMapper';
import { buildProfilePayload } from '../utils/payloadBuilder';

interface UseProfileBodyAnalysisReturn {
    analisarFotoCorporal: (base64String: string) => Promise<AnaliseData | null>;
    salvarDadosAnalise: (dadosParaSalvar: UserProfileData) => Promise<void>;
    isAnalyzing: boolean;
    isSaving: boolean;
}

export const useProfileBodyAnalysis = (): UseProfileBodyAnalysisReturn => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const analisarFotoCorporal = async (base64String: string): Promise<AnaliseData | null> => {
        setIsAnalyzing(true);
        try {
            console.log('📸 Enviando foto para análise do corpo...');
            const response = await api.post('/api/usuario/descrever-corpo', {
                foto_base64: base64String
            });

            console.log('✅ Análise do corpo recebida:', response.data);

            const { analise } = response.data;
            return analise;
        } catch (error) {
            console.error('❌ Erro ao analisar corpo:', error);
            throw error;
        } finally {
            setIsAnalyzing(false);
        }
    };

    const salvarDadosAnalise = async (dadosParaSalvar: UserProfileData): Promise<void> => {
        setIsSaving(true);
        try {
            console.log('💾 Salvando dados da análise no banco de dados...');

            const payload = buildProfilePayload(dadosParaSalvar);

            await api.put('/api/usuario/medidas', payload);
            console.log('✅ Dados salvos com sucesso!');
        } catch (error) {
            console.error("❌ Erro ao salvar análise:", error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return { analisarFotoCorporal, salvarDadosAnalise, isAnalyzing, isSaving };
};
