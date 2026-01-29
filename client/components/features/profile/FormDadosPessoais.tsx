import React from 'react';
import { InputText } from '../../ui/inputs/InputText';
import { InputSelect } from '../../ui/inputs/InputSelect';
import { InputGroup } from '../../ui/InputGroup';

interface FormDadosPessoaisProps {
    formData: {
        nome: string;
        email: string;
        cpf?: string;
        telefone?: string;
        sexo?: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const FormDadosPessoais: React.FC<FormDadosPessoaisProps> = ({ formData, onChange }) => {
    return (
        <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
            <InputText
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={onChange}
            />
            <InputText
                label="Email"
                value={formData.email}
                disabled
            />
            <InputText
                label="Telefone"
                name="telefone"
                placeholder="(00) 0000-0000"
                value={formData.telefone || ''}
                onChange={onChange}
                optional
            />
            <InputText
                label="CPF"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf || ''}
                onChange={onChange}
                optional
            />
            <InputSelect
                label="Sexo"
                name="sexo"
                value={formData.sexo || ''}
                onChange={onChange}
                options={[
                    { value: 'feminino', label: 'Feminino' },
                    { value: 'masculino', label: 'Masculino' },
                    { value: 'outro', label: 'Outro' }
                ]}
            />
        </InputGroup>
    );
};
