import React from 'react';

/**
 * InputText Component
 * Componente atômico para inputs de texto genéricos
 * 
 * @example
 * <InputText 
 *   label="Nome" 
 *   name="nome" 
 *   value={data.nome}
 *   onChange={handleChange}
 *   placeholder="Digite seu nome"
 * />
 */

interface InputTextProps {
    label?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    required?: boolean;
    optional?: boolean;
}

export const InputText: React.FC<InputTextProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled = false,
    type = 'text',
    required = false,
    optional = false,
}) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {optional && <span className="text-gray-500 text-xs ml-1">(opcional)</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
            />
        </div>
    );
};

export default InputText;
