import React from 'react';

interface FormHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
    title,
    subtitle,
    icon = '📦'
}) => {
    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
                {icon} {title}
            </h2>
            {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
        </div>
    );
};
