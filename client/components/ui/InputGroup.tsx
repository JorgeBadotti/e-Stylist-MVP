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
    cols = { mobile: 1, sm: undefined, md: 2, lg: undefined, xl: undefined },
    gap = '6',
}) => {
    // Mapa de classes estáticas para Tailwind (necessário para purge)
    const colsMap: { [key: number]: string } = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };

    const smColsMap: { [key: number]: string } = {
        1: 'sm:grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-4',
    };

    const mdColsMap: { [key: number]: string } = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    };

    const lgColsMap: { [key: number]: string } = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
    };

    const xlColsMap: { [key: number]: string } = {
        1: 'xl:grid-cols-1',
        2: 'xl:grid-cols-2',
        3: 'xl:grid-cols-3',
        4: 'xl:grid-cols-4',
    };

    const gapMap: { [key: string]: string } = {
        '2': 'gap-2',
        '3': 'gap-3',
        '4': 'gap-4',
        '6': 'gap-6',
        '8': 'gap-8',
    };

    const mobileCol = cols.mobile ? colsMap[cols.mobile] : colsMap[1];
    const smCol = cols.sm ? smColsMap[cols.sm] : '';
    const mdCol = cols.md ? mdColsMap[cols.md] : mdColsMap[2];
    const lgCol = cols.lg ? lgColsMap[cols.lg] : '';
    const xlCol = cols.xl ? xlColsMap[cols.xl] : '';
    const gapClass = gapMap[gap];

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
