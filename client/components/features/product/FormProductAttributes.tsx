import React from 'react';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputGroup } from '../../ui/InputGroup';
import { DadosProduto, Dicionario } from '../types';

interface FormProductAttributesProps {
    formData: DadosProduto;
    dicionarios: { [key: string]: Dicionario[] };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Seção de Atributos do Produto
 * Agrupa campos: Silhueta, Comprimento, Posição Cintura, Ocasião, Estação
 */
export const FormProductAttributes: React.FC<FormProductAttributesProps> = ({
    formData,
    dicionarios,
    onChange
}) => {
    return (
        <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                ✨ Atributos do Produto
            </h3>

            <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                <InputSelect
                    label="Silhueta"
                    name="silhueta"
                    value={formData.silhueta || ''}
                    onChange={onChange}
                    options={dicionarios['SILHUETA']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    optional
                />

                <InputSelect
                    label="Comprimento"
                    name="comprimento"
                    value={formData.comprimento || ''}
                    onChange={onChange}
                    options={dicionarios['COMPRIMENTO']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    optional
                />

                <InputSelect
                    label="Posição Cintura"
                    name="posicao_cintura"
                    value={formData.posicao_cintura || ''}
                    onChange={onChange}
                    options={dicionarios['POSICAO_CINTURA']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    optional
                />

                <InputSelect
                    label="Ocasião"
                    name="ocasiao"
                    value={formData.ocasiao || ''}
                    onChange={onChange}
                    options={dicionarios['OCASIAO']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    optional
                />

                <InputSelect
                    label="Estação"
                    name="estacao"
                    value={formData.estacao || ''}
                    onChange={onChange}
                    options={dicionarios['ESTACAO']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    optional
                />
            </InputGroup>
        </div>
    );
};
