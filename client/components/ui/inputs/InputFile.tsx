import React, { useState } from 'react';

interface InputFileProps {
    label?: string;
    name?: string;
    value?: string; // URL ou base64 da imagem
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    optional?: boolean;
    accept?: string; // Ex: "image/*" ou ".jpg,.png"
    maxSize?: number; // Em bytes. Default: 5MB (5242880)
    showPreview?: boolean;
}

/**
 * InputFile Component
 * Componente atômico para upload de imagens com preview, validação e feedback
 * 
 * @example
 * <InputFile 
 *   label="Foto do Produto" 
 *   name="imagem"
 *   onChange={handleImageChange}
 *   maxSize={5242880}
 *   optional
 * />
 */

export const InputFile: React.FC<InputFileProps> = ({
    label,
    name,
    value,
    onChange,
    disabled = false,
    optional = false,
    accept = 'image/jpeg,image/png,image/webp',
    maxSize = 5242880, // 5MB default
    showPreview = true,
}) => {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [error, setError] = useState<string | null>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);

        if (!file) {
            setPreview(null);
            onChange(e);
            return;
        }

        // Validar tipo de arquivo
        const validTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const isValidType = validTypes.some(vt =>
            vt === '*/*' ||
            fileType === vt ||
            fileType.match(new RegExp(vt.replace('*', '.*')))
        );

        if (!isValidType) {
            setError(`❌ Tipo inválido. Aceitos: ${accept}`);
            return;
        }

        // Validar tamanho
        if (file.size > maxSize) {
            setError(
                `❌ Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}. ` +
                `Seu arquivo: ${formatFileSize(file.size)}`
            );
            return;
        }

        // Se passou nas validações, ler arquivo como Data URL para preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setPreview(result);

            // Chamar onChange com o arquivo original
            onChange(e);
        };
        reader.onerror = () => {
            setError('❌ Erro ao ler arquivo');
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {optional && <span className="text-gray-400 ml-1">(opcional)</span>}
                </label>
            )}

            {/* Preview */}
            {showPreview && preview && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 p-2">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-cover rounded"
                    />
                </div>
            )}

            {/* Input File */}
            <input
                type="file"
                name={name}
                onChange={handleFileChange}
                disabled={disabled}
                accept={accept}
                className={`
                    block w-full text-sm text-gray-500 file:mr-4 file:py-2 
                    file:px-4 file:rounded-lg file:border-0 file:text-sm 
                    file:font-semibold file:bg-blue-50 file:text-blue-700 
                    hover:file:bg-blue-100 cursor-pointer
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            />

            {/* Info Text */}
            <p className="text-xs text-gray-500 mt-2">
                Máximo: {formatFileSize(maxSize)}
                {accept && ` • Tipos: ${accept.split(',').join(', ')}`}
            </p>

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
};
