import React from 'react';

/**
 * InputNumber Component
 * Componente atômico para inputs numéricos (medidas corporais)
 * 
 * @example
 * <InputNumber 
 *   label="Altura (cm)" 
 *   name="altura" 
 *   value={formData.medidas.altura}
 *   onChange={handleChange}
 *   placeholder="Ex: 165"
 *   min={0}
 *   max={300}
 * />
 */

interface InputNumberProps {
    label?: string;
    name?: string;
    value: number | string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

export const InputNumber: React.FC<InputNumberProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled = false,
    min,
    max,
    step = 1,
}) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
            />
        </div>
    );
};

export default InputNumber;
