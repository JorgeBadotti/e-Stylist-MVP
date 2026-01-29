import React from 'react';

interface AlertProps {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}

const Alert: React.FC<AlertProps> = ({ message, type = 'info', className = '' }) => {
    let bgColor = 'bg-blue-100';
    let borderColor = 'border-blue-500';
    let textColor = 'text-blue-800';

    switch (type) {
        case 'success':
            bgColor = 'bg-green-100';
            borderColor = 'border-green-500';
            textColor = 'text-green-800';
            break;
        case 'warning':
            bgColor = 'bg-yellow-100';
            borderColor = 'border-yellow-500';
            textColor = 'text-yellow-800';
            break;
        case 'error':
            bgColor = 'bg-red-100';
            borderColor = 'border-red-500';
            textColor = 'text-red-800';
            break;
        case 'info':
        default:
            // Default blue already set
            break;
    }

    return (
        <div className={`${bgColor} border-l-4 ${borderColor} ${textColor} p-4 rounded-md ${className}`} role="alert">
            <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
            <p>{message}</p>
        </div>
    );
};

export default Alert;
