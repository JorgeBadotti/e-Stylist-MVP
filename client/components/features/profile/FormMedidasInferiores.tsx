import React from 'react';
import { InputNumber } from '../../ui/inputs/InputNumber';
import { InputGroup } from '../../ui/InputGroup';

interface FormMedidasInferioresProps {
    medidas: {
        coxa?: number;
        panturrilha?: number;
        tornozelo?: number;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormMedidasInferiores: React.FC<FormMedidasInferioresProps> = ({ medidas, onChange }) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                👖 Medidas da Parte Inferior <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
            </h3>
            <InputGroup cols={{ mobile: 2, md: 4 }} gap="4">
                <InputNumber
                    label="Coxa (cm)"
                    name="coxa"
                    value={medidas.coxa || 0}
                    onChange={onChange}
                    placeholder="Ex: 56"
                />
                <InputNumber
                    label="Panturrilha (cm)"
                    name="panturrilha"
                    value={medidas.panturrilha || 0}
                    onChange={onChange}
                    placeholder="Ex: 38"
                />
                <InputNumber
                    label="Tornozelo (cm)"
                    name="tornozelo"
                    value={medidas.tornozelo || 0}
                    onChange={onChange}
                    placeholder="Ex: 22"
                />
            </InputGroup>
        </div>
    );
};
