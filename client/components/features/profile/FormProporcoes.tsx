import React from 'react';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputGroup } from '../../ui/InputGroup';

interface FormProporcoesProps {
    proporcoes: {
        pernas?: string;
        torso?: string;
        ombros_vs_quadril?: string;
    };
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const FormProporcoes: React.FC<FormProporcoesProps> = ({ proporcoes, onChange }) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚖️ Proporções Corporais</h3>
            <InputGroup cols={{ mobile: 1, md: 2 }} gap="4">
                <InputSelect
                    label="Pernas"
                    name="pernas"
                    value={proporcoes?.pernas || ''}
                    onChange={onChange}
                    options={[
                        { value: 'curtas', label: 'Curtas' },
                        { value: 'balanced', label: 'Balanceadas' },
                        { value: 'longas', label: 'Longas' }
                    ]}
                />
                <InputSelect
                    label="Tronco"
                    name="torso"
                    value={proporcoes?.torso || ''}
                    onChange={onChange}
                    options={[
                        { value: 'curto', label: 'Curto' },
                        { value: 'balanced', label: 'Balanceado' },
                        { value: 'longo', label: 'Longo' }
                    ]}
                />
                <InputSelect
                    label="Ombros vs Quadril"
                    name="ombros_vs_quadril"
                    value={proporcoes?.ombros_vs_quadril || ''}
                    onChange={onChange}
                    options={[
                        { value: 'ombros_largos', label: 'Ombros Largos' },
                        { value: 'balanced', label: 'Balanceados' },
                        { value: 'quadril_largo', label: 'Quadril Largo' }
                    ]}
                />
            </InputGroup>
        </div>
    );
};
