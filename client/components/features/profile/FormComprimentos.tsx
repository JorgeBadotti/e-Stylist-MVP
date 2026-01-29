import React from 'react';
import { InputNumber } from '../../ui/inputs/InputNumber';
import { InputGroup } from '../../ui/InputGroup';

interface FormComprimentosProps {
    medidas: {
        comprimento_torso?: number;
        comprimento_perna?: number;
        comprimento_braco?: number;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormComprimentos: React.FC<FormComprimentosProps> = ({ medidas, onChange }) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📐 Comprimentos <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
            </h3>
            <InputGroup cols={{ mobile: 2, md: 3 }} gap="4">
                <InputNumber
                    label="Comprimento Tronco (cm)"
                    name="comprimento_torso"
                    value={medidas.comprimento_torso || 0}
                    onChange={onChange}
                    placeholder="Ex: 58"
                />
                <InputNumber
                    label="Comprimento Perna (cm)"
                    name="comprimento_perna"
                    value={medidas.comprimento_perna || 0}
                    onChange={onChange}
                    placeholder="Ex: 85"
                />
                <InputNumber
                    label="Comprimento Braço (cm)"
                    name="comprimento_braco"
                    value={medidas.comprimento_braco || 0}
                    onChange={onChange}
                    placeholder="Ex: 72"
                />
            </InputGroup>
        </div>
    );
};
