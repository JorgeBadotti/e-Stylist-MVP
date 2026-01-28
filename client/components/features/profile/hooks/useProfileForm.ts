import React, { useState } from 'react';
import { UserProfileData } from '../types';

const initialFormData: UserProfileData = {
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    sexo: '',
    foto_corpo: '',
    tipo_corpo: '',
    altura_cm: 0,
    estilo_pessoal: '',
    medidas: {
        busto: 0,
        cintura: 0,
        quadril: 0,
        altura: 0,
        pescoco: 0,
        ombro: 0,
        braco: 0,
        antebraco: 0,
        pulso: 0,
        torax: 0,
        sobpeito: 0,
        costelas: 0,
        panturrilha: 0,
        coxa: 0,
        tornozelo: 0,
        comprimento_torso: 0,
        comprimento_perna: 0,
        comprimento_braco: 0
    },
    proporcoes: {
        pernas: '',
        torso: '',
        ombros_vs_quadril: '',
        confidence: 0
    }
};

interface UseProfileFormReturn {
    formData: UserProfileData;
    setFormData: (data: UserProfileData) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    updateFormData: (data: Partial<UserProfileData>) => void;
}

export const useProfileForm = (initialData: UserProfileData = initialFormData): UseProfileFormReturn => {
    const [formData, setFormData] = useState<UserProfileData>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Campos de medidas
        const camposMedidas = [
            'busto', 'cintura', 'quadril', 'altura', 'pescoco', 'ombro', 'braco',
            'antebraco', 'pulso', 'torax', 'sobpeito', 'costelas', 'panturrilha',
            'coxa', 'tornozelo', 'comprimento_torso', 'comprimento_perna', 'comprimento_braco'
        ];

        // Campos de proporções
        const camposProporcoes = ['pernas', 'torso', 'ombros_vs_quadril', 'confidence'];

        if (camposMedidas.includes(name)) {
            setFormData(prev => ({
                ...prev,
                medidas: {
                    ...prev.medidas,
                    [name]: Number(value) || 0
                }
            }));
        } else if (camposProporcoes.includes(name)) {
            setFormData(prev => ({
                ...prev,
                proporcoes: {
                    ...(prev.proporcoes || {}),
                    [name]: isNaN(Number(value)) ? value : Number(value)
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const updateFormData = (data: Partial<UserProfileData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    return { formData, setFormData, handleChange, updateFormData };
};
