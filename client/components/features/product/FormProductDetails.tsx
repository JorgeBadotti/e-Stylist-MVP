import React from 'react';
import { InputText } from '../../ui/inputs/InputText';
import { InputFile } from '../../ui/inputs/InputFile';
import { DadosProduto } from './types';

interface FormProductDetailsProps {
    formData: DadosProduto;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

/**
 * Seção de Detalhes do Produto
 * Agrupa campos: Nome, Descrição, Imagem
 */
export const FormProductDetails: React.FC<FormProductDetailsProps> = ({
    formData,
    onChange
}) => {
    return (
        <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                📝 Detalhes do Produto
            </h3>

            <div className="space-y-6">
                <InputText
                    label="Nome do Produto"
                    name="nome"
                    value={formData.nome}
                    onChange={onChange}
                    placeholder="Ex: Camiseta Básica Preta"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                    </label>
                    <textarea
                        name="descricao"
                        value={formData.descricao || ''}
                        onChange={onChange}
                        placeholder="Descrição detalhada do produto..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <InputFile
                    label="Imagem do Produto"
                    name="imagem"
                    value={formData.imagem}
                    onChange={onChange}
                    accept="image/jpeg,image/png,image/webp"
                    maxSize={5242880}
                    showPreview={true}
                    optional
                />
            </div>
        </div>
    );
};
