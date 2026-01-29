import React from 'react';

/**
 * InputSelect Component
 * Componente atômico para selects genéricos
 * 
 * @example
 * <InputSelect 
 *   label="Sexo" 
 *   name="sexo" 
 *   value={formData.sexo}
 *   onChange={handleChange}
 *   options={[
 *     { value: 'feminino', label: 'Feminino' },
 *     { value: 'masculino', label: 'Masculino' },
 *     { value: 'outro', label: 'Outro' }
 *   ]}
 * />
 */

interface SelectOption {
    value: string | number;
    label: string;
}

interface InputSelectProps {
    label?: string;
    name?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    disabled?: boolean;
    placeholder?: string;
}

export const InputSelect: React.FC<InputSelectProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    disabled = false,
    placeholder = 'Selecione...',
}) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default InputSelect;
