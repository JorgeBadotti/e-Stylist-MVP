import React from 'react';

/**
 * InputGroup Component
 * Wrapper para agrupar inputs em grid responsivo
 * 
 * @example
 * <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
 *   <InputText label="Nome" ... />
 *   <InputText label="Email" ... />
 *   <InputText label="CPF" ... />
 *   <InputSelect label="Sexo" ... />
 * </InputGroup>
 */

interface InputGroupProps {
    children: React.ReactNode;
    cols?: {
        mobile?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: '2' | '3' | '4' | '6' | '8';
}

export const InputGroup: React.FC<InputGroupProps> = ({
    children,
    cols = { mobile: 1, md: 2 },
    gap = '6',
}) => {
    // Construir classes dinâmicas para grid
    const mobileCol = cols.mobile ? `grid-cols-${cols.mobile}` : 'grid-cols-1';
    const smCol = cols.sm ? `sm:grid-cols-${cols.sm}` : '';
    const mdCol = cols.md ? `md:grid-cols-${cols.md}` : 'md:grid-cols-2';
    const lgCol = cols.lg ? `lg:grid-cols-${cols.lg}` : '';
    const xlCol = cols.xl ? `xl:grid-cols-${cols.xl}` : '';

    const gapClass = `gap-${gap}`;

    const gridClasses = [
        'grid',
        mobileCol,
        smCol,
        mdCol,
        lgCol,
        xlCol,
        gapClass,
    ]
        .filter(Boolean)
        .join(' ');

    return <div className={gridClasses}>{children}</div>;
};

export default InputGroup;
