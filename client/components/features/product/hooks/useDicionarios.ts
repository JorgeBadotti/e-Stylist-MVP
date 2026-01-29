import { useState, useEffect } from 'react';
import { Dicionario, DicionariosMap } from '../types';

interface UseDicionariosReturn {
    dicionarios: DicionariosMap;
    carregando: boolean;
    erro: string | null;
    carregarDicionarios: () => Promise<void>;
}

/**
 * Hook para carregar dicionários do backend
 * Centraliza toda a lógica de carregamento e erro
 */
export const useDicionarios = (): UseDicionariosReturn => {
    const [dicionarios, setDicionarios] = useState<DicionariosMap>({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregarDicionarios = async () => {
        try {
            setCarregando(true);
            setErro(null);

            const tipos = [
                'CATEGORIA',
                'LINHA',
                'COR',
                'TAMANHO',
                'LAYER_ROLE',
                'COLOR_ROLE',
                'FIT',
                'STYLE_BASE',
                'SILHUETA',
                'COMPRIMENTO',
                'POSICAO_CINTURA',
                'OCASIAO',
                'ESTACAO',
                'TEMPERATURA',
                'MATERIAL',
                'ECO_SCORE',
                'CARE_LEVEL',
                'FAIXA_PRECO'
            ];

            const dicsCarregados: { [key: string]: Dicionario[] } = {};

            for (const tipo of tipos) {
                try {
                    const url = `/api/produtos/dicionarios/?tipo=${tipo}`;
                    console.log(`📚 [useDicionarios] Carregando dicionário: ${url}`);
                    const response = await fetch(url);
                    console.log(`✅ [useDicionarios] ${tipo} - Status: ${response.status}`);
                    if (response.ok) {
                        const data = await response.json();
                        dicsCarregados[tipo] = data.dados || [];
                        console.log(`✅ [useDicionarios] ${tipo} carregado: ${dicsCarregados[tipo].length} valores`);
                    } else {
                        console.error(`❌ [useDicionarios] ${tipo} - Erro ${response.status}:`, response.statusText);
                    }
                } catch (e) {
                    console.error(`❌ [useDicionarios] Erro ao carregar ${tipo}:`, e);
                }
            }

            setDicionarios(dicsCarregados);
            setCarregando(false);
        } catch (e) {
            setErro('Erro ao carregar dicionários');
            setCarregando(false);
            console.error(e);
        }
    };

    // Carregar ao montar
    useEffect(() => {
        carregarDicionarios();
    }, []);

    return { dicionarios, carregando, erro, carregarDicionarios };
};
