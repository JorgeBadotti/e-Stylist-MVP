/**
 * SKU STYLEME v1 - Gerador e Validador
 * 
 * Responsável por:
 * 1. Gerar códigos SKU automáticos
 * 2. Validar integridade do SKU
 * 3. Extrair componentes do SKU
 * 
 * Formato: [CATEGORIA]-[LINHA]-[COR]-[TAMANHO]-[SEQ]-[COLECAO]
 * Exemplo: CAM-F-PRT-M-023-F24
 */

/**
 * Gera sequencial único (3 dígitos)
 * @param {string} categoria - Código da categoria
 * @param {string} colecao - Código da coleção
 * @returns {Promise<string>} Sequencial (ex: "001", "002", ..., "999")
 */
export async function gerarSequencial(categoria, colecao, Produto) {
    try {
        // Contar quantos produtos existem com esta categoria e coleção
        const count = await Produto.countDocuments({
            categoria,
            colecao,
            status: { $ne: 'DESCONTINUADO' }
        });

        // Próximo sequencial (começar de 001)
        const proximo = String(count + 1).padStart(3, '0');

        return proximo;
    } catch (error) {
        console.error('Erro ao gerar sequencial:', error);
        return '001'; // Fallback
    }
}

/**
 * Gera código SKU STYLEME completo
 * Padrão da indústria: retorna objeto com todos os componentes separados
 * 
 * @param {Object} dados - Dados do produto
 * @param {string} dados.categoria - Código categoria (ex: CAM)
 * @param {string} dados.linha - Linha gênero (F, M, U)
 * @param {string} dados.cor_codigo - Código cor (ex: PRT)
 * @param {string} dados.tamanho - Tamanho (ex: M, 40)
 * @param {string} dados.sequencia - Sequencial (ex: 023) - se não fornecido, gera automático
 * @param {string} dados.colecao - Código coleção (ex: F24)
 * @param {Object} Produto - Model Mongoose do Produto
 * @returns {Promise<Object>} Objeto com SKU e todos os componentes
 * @example
 * {
 *   skuStyleMe: "CAM-F-PRT-M-023-F24",
 *   categoria: "CAM",
 *   linha: "F",
 *   cor_codigo: "PRT",
 *   tamanho: "M",
 *   sequencia: "023",
 *   colecao: "F24"
 * }
 */
export async function gerarSKUStyleMe(dados, Produto) {
    const { categoria, linha, cor_codigo, tamanho, colecao } = dados;
    let { sequencia } = dados;

    // Validações básicas
    if (!categoria || !linha || !cor_codigo || !tamanho || !colecao) {
        throw new Error('SKU STYLEME requer: categoria, linha, cor_codigo, tamanho, colecao');
    }

    // Gerar sequencial se não fornecido
    if (!sequencia) {
        sequencia = await gerarSequencial(categoria, colecao, Produto);
    }

    // Montar SKU
    const skuStyleMe = `${categoria}-${linha}-${cor_codigo}-${tamanho}-${sequencia}-${colecao}`;

    // Validar formato
    const regex = /^[A-Z]{3}-[A-Z]-[A-Z]{3}-[A-Z0-9]{1,2}-\d{3}-[A-Z]\d{2}$/;
    if (!regex.test(skuStyleMe)) {
        throw new Error(`SKU gerado inválido: ${skuStyleMe}. Verifique os componentes.`);
    }

    // Retornar objeto com componentes separados (padrão da indústria)
    return {
        skuStyleMe,
        categoria,
        linha,
        cor_codigo,
        tamanho,
        sequencia,
        colecao
    };
}

/**
 * Valida integridade de um SKU STYLEME
 * @param {string} sku - SKU a validar
 * @returns {Object} { valido: boolean, erros: string[] }
 */
export function validarSKUStyleMe(sku) {
    const erros = [];

    if (!sku || typeof sku !== 'string') {
        return { valido: false, erros: ['SKU deve ser uma string válida'] };
    }

    // Validar formato geral
    const regex = /^[A-Z]{3}-[A-Z]-[A-Z]{3}-[A-Z0-9]{1,2}-\d{3}-[A-Z]\d{2}$/;
    if (!regex.test(sku)) {
        erros.push(`Formato inválido: ${sku}. Esperado: [CAT]-[L]-[COR]-[TAM]-[SEQ]-[COL]`);
        return { valido: false, erros };
    }

    const partes = sku.split('-');
    const [categoria, linha, cor, tamanho, seq, colecao] = partes;

    // Validar categoria (3 letras)
    const categoriasValidas = [
        'CAM', 'SHI', 'TOP', 'SWE', 'CAL', 'JEA', 'SAI', 'SHO', 'BER',
        'VES', 'MAC', 'JKT', 'CAS', 'COA', 'BLA', 'TEN', 'SAP', 'BOT',
        'SAN', 'SLI', 'OXF', 'MOC', 'SCA', 'ANI', 'BAG', 'BEL', 'HAT',
        'JEW', 'WAT', 'SCA_ACC', 'GLA', 'TIE'
    ];
    if (!categoriasValidas.includes(categoria)) {
        erros.push(`Categoria desconhecida: ${categoria}`);
    }

    // Validar linha (F, M, U)
    if (!['F', 'M', 'U'].includes(linha)) {
        erros.push(`Linha deve ser F, M ou U. Recebido: ${linha}`);
    }

    // Validar cor (3 letras)
    if (!/^[A-Z]{3}$/.test(cor)) {
        erros.push(`Código cor deve ter 3 letras. Recebido: ${cor}`);
    }

    // Validar tamanho (1-2 caracteres alpanuméricos)
    if (!/^[A-Z0-9]{1,2}$/.test(tamanho)) {
        erros.push(`Tamanho deve ter 1-2 caracteres. Recebido: ${tamanho}`);
    }

    // Validar sequencial (3 dígitos)
    if (!/^\d{3}$/.test(seq)) {
        erros.push(`Sequencial deve ter 3 dígitos. Recebido: ${seq}`);
    }

    // Validar coleção (letra + 2 dígitos)
    if (!/^[A-Z]\d{2}$/.test(colecao)) {
        erros.push(`Coleção deve ter formato [LETRA][2DÍGITOS]. Recebido: ${colecao}`);
    }

    return {
        valido: erros.length === 0,
        erros
    };
}

/**
 * Extrai componentes de um SKU STYLEME
 * @param {string} sku - SKU a processar
 * @returns {Object} Componentes extraídos
 */
export function extrairComponentesSKU(sku) {
    const validacao = validarSKUStyleMe(sku);
    if (!validacao.valido) {
        throw new Error(`SKU inválido: ${validacao.erros.join(', ')}`);
    }

    const [categoria, linha, cor_codigo, tamanho, sequencia, colecao] = sku.split('-');

    return {
        categoria,
        linha,
        cor_codigo,
        tamanho,
        sequencia,
        colecao,
        skuCompleto: sku
    };
}

/**
 * Gera descrição legível do SKU
 * Útil para exibição em UI
 * @param {string} sku - SKU STYLEME
 * @param {Object} mapeamentos - Dicionários para tradução
 * @returns {string} Descrição legível
 */
export function descreverSKU(sku, mapeamentos = {}) {
    try {
        const { categoria, linha, cor_codigo, tamanho, sequencia, colecao } = extrairComponentesSKU(sku);

        // Usar mapeamentos fornecidos ou deixar códigos
        const descCategoria = mapeamentos.categoria?.[categoria] || categoria;
        const descLinha = { F: 'Feminina', M: 'Masculina', U: 'Unissex' }[linha] || linha;
        const descCor = mapeamentos.cor?.[cor_codigo] || cor_codigo;
        const descColecao = mapeamentos.colecao?.[colecao] || colecao;

        return `${descCategoria} ${descLinha} ${descCor} Tamanho ${tamanho} (${descColecao})`;
    } catch (error) {
        return sku; // Retornar o SKU original se houver erro
    }
}

/**
 * Verifica duplicata de SKU
 * @param {string} sku - SKU a verificar
 * @param {Object} Produto - Model Mongoose
 * @param {string} excluirId - ID do documento a excluir da busca (para atualização)
 * @returns {Promise<boolean>} true se já existe, false se é único
 */
export async function verificarDuplicataSKU(sku, Produto, excluirId = null) {
    try {
        const query = { skuStyleMe: sku };
        if (excluirId) {
            query._id = { $ne: excluirId };
        }

        const existe = await Produto.findOne(query);
        return !!existe;
    } catch (error) {
        console.error('Erro ao verificar duplicata SKU:', error);
        return false;
    }
}

/**
 * Sugestão de próximo SKU (para interface)
 * @param {Object} dados - Dados base
 * @param {Object} Produto - Model Mongoose
 * @returns {Promise<string>} SKU sugerido
 */
export async function sugerirProximoSKU(dados, Produto) {
    try {
        return await gerarSKUStyleMe(dados, Produto);
    } catch (error) {
        console.error('Erro ao sugerir próximo SKU:', error);
        throw error;
    }
}

export default {
    gerarSKUStyleMe,
    validarSKUStyleMe,
    extrairComponentesSKU,
    descreverSKU,
    verificarDuplicataSKU,
    sugerirProximoSKU,
    gerarSequencial
};
