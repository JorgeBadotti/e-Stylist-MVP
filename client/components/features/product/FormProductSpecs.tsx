import React from 'react';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputNumber } from '../../ui/inputs/InputNumber';
import { InputGroup } from '../../ui/InputGroup';
import { DadosProduto, Dicionario } from './types';

interface FormProductSpecsProps {
    formData: DadosProduto;
    dicionarios: { [key: string]: Dicionario[] };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Seção de Especificações Técnicas
 * Agrupa campos: Temperatura, Material, Eco Score, Care Level, Faixa Preço, Peça Hero, Classe Margem
 */
export const FormProductSpecs: React.FC<FormProductSpecsProps> = ({
    formData,
    dicionarios,
    onChange
}) => {
    const classeMargemOptions = [
        { value: 'PREMIUM', label: 'PREMIUM - Margem Alta' },
        { value: 'REGULAR', label: 'REGULAR - Margem Normal' },
        { value: 'BUDGET', label: 'BUDGET - Margem Baixa' }
    ];

    return (
        <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                ⚙️ Especificações Técnicas
            </h3>

            <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                <InputSelect
                    label="Temperatura"
                    name="temperatura"
                    value={formData.temperatura || ''}
                    onChange={onChange}
                    options={[
                        { value: '', label: '— Não definido —' },
                        ...(dicionarios['TEMPERATURA']?.map(item => ({
                            value: item.codigo,
                            label: item.descricao
                        })) || [])
                    ]}
                    optional
                />

                <InputSelect
                    label="Material Principal"
                    name="material_principal"
                    value={formData.material_principal || ''}
                    onChange={onChange}
                    options={[
                        { value: '', label: '— Não definido —' },
                        ...(dicionarios['MATERIAL']?.map(item => ({
                            value: item.codigo,
                            label: item.descricao
                        })) || [])
                    ]}
                    optional
                />

                <InputNumber
                    label="Eco Score"
                    name="eco_score"
                    value={formData.eco_score ? Number(formData.eco_score) : 0}
                    onChange={onChange}
                    placeholder="0-100"
                    optional
                />

                <InputNumber
                    label="Care Level"
                    name="care_level"
                    value={formData.care_level ? Number(formData.care_level) : 0}
                    onChange={onChange}
                    placeholder="0-10"
                    optional
                />

                <InputSelect
                    label="Faixa de Preço"
                    name="faixa_preco"
                    value={formData.faixa_preco || ''}
                    onChange={onChange}
                    options={dicionarios['FAIXA_PRECO']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    optional
                />

                <InputSelect
                    label="Classe de Margem"
                    name="classe_margem"
                    value={formData.classe_margem || ''}
                    onChange={onChange}
                    options={classeMargemOptions}
                    optional
                />
            </InputGroup>

            {/* Peça Hero - Checkbox */}
            <div className="mt-6 pt-6 border-t">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        name="peca_hero"
                        checked={formData.peca_hero || false}
                        onChange={onChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                        ⭐ Peça Hero (Destaque)
                    </span>
                </label>
            </div>
        </div>
    );
};
