import React from 'react';
import { InputNumber } from '../../ui/inputs/InputNumber';
import { InputGroup } from '../../ui/InputGroup';

interface FormMedidasBasicasProps {
    medidas: {
        altura: number;
        busto: number;
        cintura: number;
        quadril: number;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormMedidasBasicas: React.FC<FormMedidasBasicasProps> = ({ medidas, onChange }) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📏 Medidas Corporais Básicas <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
            </h3>
            <InputGroup cols={{ mobile: 2, md: 4 }} gap="4">
                <InputNumber
                    label="Altura (cm)"
                    name="altura"
                    value={medidas.altura}
                    onChange={onChange}
                    placeholder="Ex: 165"
                />
                <InputNumber
                    label="Busto (cm)"
                    name="busto"
                    value={medidas.busto}
                    onChange={onChange}
                    placeholder="Ex: 92"
                />
                <InputNumber
                    label="Cintura (cm)"
                    name="cintura"
                    value={medidas.cintura}
                    onChange={onChange}
                    placeholder="Ex: 75"
                />
                <InputNumber
                    label="Quadril (cm)"
                    name="quadril"
                    value={medidas.quadril}
                    onChange={onChange}
                    placeholder="Ex: 95"
                />
            </InputGroup>
        </div>
    );
};
