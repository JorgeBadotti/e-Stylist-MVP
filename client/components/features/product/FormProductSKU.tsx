import React from 'react';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputGroup } from '../../ui/InputGroup';
import { DadosProduto, Dicionario } from '../types';

interface FormProductSKUProps {
    formData: DadosProduto;
    dicionarios: { [key: string]: Dicionario[] };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Seção de SKU STYLEME
 * Agrupa campos: Collection, Layer Role, Color Role, Fit, Style Base
 */
export const FormProductSKU: React.FC<FormProductSKUProps> = ({
    formData,
    dicionarios,
    onChange
}) => {
    const fitOptions = [
        { value: 'JUSTO', label: 'JUSTO - Ajustado' },
        { value: 'REGULAR', label: 'REGULAR - Segue silhueta' },
        { value: 'SOLTO', label: 'SOLTO - Cai sobre corpo' },
        { value: 'OVERSIZE', label: 'OVERSIZE - Maior que tamanho' }
    ];

    const styleBaseOptions = [
        { value: 'CASUAL', label: 'CASUAL - Descontraído' },
        { value: 'FORMAL', label: 'FORMAL - Elegante' },
        { value: 'SPORT', label: 'SPORT - Esportivo' },
        { value: 'CHIC', label: 'CHIC - Sofisticado' }
    ];

    return (
        <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                🔑 SKU STYLEME (Obrigatórios)
            </h3>

            <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                <InputSelect
                    label="Collection"
                    name="colecao"
                    value={formData.colecao}
                    onChange={onChange}
                    options={dicionarios['COLECAO']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />

                <InputSelect
                    label="Layer Role"
                    name="layer_role"
                    value={formData.layer_role}
                    onChange={onChange}
                    options={dicionarios['LAYER_ROLE']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />

                <InputSelect
                    label="Color Role"
                    name="color_role"
                    value={formData.color_role}
                    onChange={onChange}
                    options={dicionarios['COLOR_ROLE']?.map(item => ({
                        value: item.codigo,
                        label: item.descricao
                    })) || []}
                    required
                />

                <InputSelect
                    label="Fit"
                    name="fit"
                    value={formData.fit}
                    onChange={onChange}
                    options={fitOptions}
                    required
                />

                <InputSelect
                    label="Style Base"
                    name="style_base"
                    value={formData.style_base}
                    onChange={onChange}
                    options={styleBaseOptions}
                    required
                />
            </InputGroup>
        </div>
    );
};
