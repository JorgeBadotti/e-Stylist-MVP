import React from 'react';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputGroup } from '../../ui/InputGroup';
import { DadosProduto, Dicionario } from './types';

interface FormProductIdentificationProps {
    formData: DadosProduto;
    dicionarios: { [key: string]: Dicionario[] };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Seção de Identificação do Produto
 * Agrupa campos: Categoria, Linha, Cor, Tamanho
 */
export const FormProductIdentification: React.FC<FormProductIdentificationProps> = ({
    formData,
    dicionarios,
    onChange
}) => {
    return (
        <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                🏷️ Identificação do Produto
            </h3>

            <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                <InputSelect
                    label="Categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={onChange}
                    options={dicionarios['CATEGORIA']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />

                <InputSelect
                    label="Linha"
                    name="linha"
                    value={formData.linha}
                    onChange={onChange}
                    options={dicionarios['LINHA']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />

                <InputSelect
                    label="Cor Código"
                    name="cor_codigo"
                    value={formData.cor_codigo}
                    onChange={onChange}
                    options={dicionarios['COR']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />

                <InputSelect
                    label="Tamanho"
                    name="tamanho"
                    value={formData.tamanho}
                    onChange={onChange}
                    options={dicionarios['TAMANHO']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />
            </InputGroup>
        </div>
    );
};
