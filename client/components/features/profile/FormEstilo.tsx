import React from 'react';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputText } from '../../ui/inputs/InputText';
import { InputGroup } from '../../ui/InputGroup';

interface FormEstiloProps {
    estilo: {
        tipo_corpo?: string;
        estilo_pessoal?: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const FormEstilo: React.FC<FormEstiloProps> = ({ estilo, onChange }) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Análise de Estilo</h3>
            <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                <InputSelect
                    label="Tipo de Corpo"
                    name="tipo_corpo"
                    value={estilo.tipo_corpo}
                    onChange={onChange}
                    options={[
                        { value: 'ampulheta', label: 'Ampulheta' },
                        { value: 'retangulo', label: 'Retângulo' },
                        { value: 'pera', label: 'Pêra / Triângulo' },
                        { value: 'maca', label: 'Maçã / Oval' },
                        { value: 'triangulo-invertido', label: 'Triângulo Invertido' }
                    ]}
                />
                <InputText
                    label="Estilo Pessoal"
                    name="estilo_pessoal"
                    placeholder="Ex: Casual, Esportivo, Clássico..."
                    value={estilo.estilo_pessoal}
                    onChange={onChange}
                />
            </InputGroup>
        </div>
    );
};
