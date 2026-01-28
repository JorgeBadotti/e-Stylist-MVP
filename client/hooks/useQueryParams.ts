import { useLocation } from 'react-router-dom';

interface QueryParams {
    itemObrigatorio: string | null;
    lojaId: string | null;
    sku: string | null;
}

/**
 * Hook para extrair e sincronizar parâmetros de query da URL
 * Automaticamente sincroniza com mudanças de location.search
 * 
 * @returns {QueryParams} Objeto com itemObrigatorio, lojaId, sku
 * 
 * @example
 * const { itemObrigatorio, lojaId, sku } = useQueryParams()
 * // URL: /gerar-looks?itemObrigatorio=SKU123&lojaid=696e987bd679d526a83c1395
 * // Retorna: { itemObrigatorio: 'SKU123', lojaId: '696e987bd679d526a83c1395', sku: null }
 */
export const useQueryParams = (): QueryParams => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    return {
        // Item obrigatório para gerar looks
        itemObrigatorio: params.get('itemObrigatorio'),
        // Loja ID - aceita tanto 'lojaId' quanto 'lojaid'
        lojaId: params.get('lojaId') || params.get('lojaid'),
        // SKU do produto
        sku: params.get('sku'),
    };
};
