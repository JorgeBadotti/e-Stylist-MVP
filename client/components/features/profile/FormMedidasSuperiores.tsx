import React from 'react';
import { InputNumber } from '../../ui/inputs/InputNumber';
import { InputGroup } from '../../ui/InputGroup';

interface FormMedidasSuperioresProps {
    medidas: {
        pescoco?: number;
        ombro?: number;
        braco?: number;
        antebraco?: number;
        pulso?: number;
        torax?: number;
        sobpeito?: number;
        costelas?: number;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormMedidasSuperiores: React.FC<FormMedidasSuperioresProps> = ({ medidas, onChange }) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                👕 Medidas da Parte Superior <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
            </h3>
            <InputGroup cols={{ mobile: 2, md: 4 }} gap="4">
                <InputNumber
                    label="Pescoço (cm)"
                    name="pescoco"
                    value={medidas.pescoco || 0}
                    onChange={onChange}
                    placeholder="Ex: 36"
                />
                <InputNumber
                    label="Ombro (cm)"
                    name="ombro"
                    value={medidas.ombro || 0}
                    onChange={onChange}
                    placeholder="Ex: 42"
                />
                <InputNumber
                    label="Braço (cm)"
                    name="braco"
                    value={medidas.braco || 0}
                    onChange={onChange}
                    placeholder="Ex: 28"
                />
                <InputNumber
                    label="Antebraço (cm)"
                    name="antebraco"
                    value={medidas.antebraco || 0}
                    onChange={onChange}
                    placeholder="Ex: 26"
                />
                <InputNumber
                    label="Pulso (cm)"
                    name="pulso"
                    value={medidas.pulso || 0}
                    onChange={onChange}
                    placeholder="Ex: 16"
                />
                <InputNumber
                    label="Tórax (cm)"
                    name="torax"
                    value={medidas.torax || 0}
                    onChange={onChange}
                    placeholder="Ex: 96"
                />
                <InputNumber
                    label="Sob Peito (cm)"
                    name="sobpeito"
                    value={medidas.sobpeito || 0}
                    onChange={onChange}
                    placeholder="Ex: 86"
                />
                <InputNumber
                    label="Costelas (cm)"
                    name="costelas"
                    value={medidas.costelas || 0}
                    onChange={onChange}
                    placeholder="Ex: 80"
                />
            </InputGroup>
        </div>
    );
};
