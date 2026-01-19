import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Dicionário oficial STYLEME v1
 * Referência técnica para todas as validações de enum
 * Imutável por natureza (versão 1.0)
 */

const dicionarioSchema = new Schema({
    tipo: {
        type: String,
        required: true,
        enum: [
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
        ],
        comment: "Tipo de dicionário"
    },

    codigo: {
        type: String,
        required: true,
        trim: true,
        comment: "Código único (ex: CAM, PRT, M)"
    },

    descricao: {
        type: String,
        required: true,
        comment: "Descrição em português"
    },

    categoria_pai: {
        type: String,
        comment: "Para sub-categorias (ex: CAM é filho de VESTUARIO_SUPERIOR)"
    },

    version: {
        type: String,
        default: '1.0',
        comment: "Versão do dicionário"
    },

    status: {
        type: String,
        enum: ['ATIVO', 'DEPRECATED', 'FUTURO'],
        default: 'ATIVO'
    }

}, {
    timestamps: true,
    collection: 'dicionarios_styleme'
});

// Índices
dicionarioSchema.index({ tipo: 1, codigo: 1 }, { unique: true });
dicionarioSchema.index({ tipo: 1, status: 1 });

const Dicionario = mongoose.models.DicionarioStyleMe || mongoose.model('DicionarioStyleMe', dicionarioSchema);

/**
 * SEED DATA - Dicionários do STYLEME v1
 */
export const DICIONARIOS_STYLEME_V1 = {
    // ═══════════════════════════════════════════════════════════
    // CATEGORIAS
    // ═══════════════════════════════════════════════════════════
    CATEGORIA: [
        // Vestuário - Superior
        { codigo: 'CAM', descricao: 'Camiseta / Blusa', categoria_pai: 'VESTUARIO_SUPERIOR' },
        { codigo: 'SHI', descricao: 'Camisa', categoria_pai: 'VESTUARIO_SUPERIOR' },
        { codigo: 'TOP', descricao: 'Top', categoria_pai: 'VESTUARIO_SUPERIOR' },
        { codigo: 'SWE', descricao: 'Suéter / Moletom', categoria_pai: 'VESTUARIO_SUPERIOR' },
        // Vestuário - Inferior
        { codigo: 'CAL', descricao: 'Calça', categoria_pai: 'VESTUARIO_INFERIOR' },
        { codigo: 'JEA', descricao: 'Jeans', categoria_pai: 'VESTUARIO_INFERIOR' },
        { codigo: 'SAI', descricao: 'Saia', categoria_pai: 'VESTUARIO_INFERIOR' },
        { codigo: 'SHO', descricao: 'Short', categoria_pai: 'VESTUARIO_INFERIOR' },
        { codigo: 'BER', descricao: 'Bermuda', categoria_pai: 'VESTUARIO_INFERIOR' },
        // Vestuário - Peça Única
        { codigo: 'VES', descricao: 'Vestido', categoria_pai: 'VESTUARIO_PECA_UNICA' },
        { codigo: 'MAC', descricao: 'Macacão', categoria_pai: 'VESTUARIO_PECA_UNICA' },
        // Vestuário - Camada Externa
        { codigo: 'JKT', descricao: 'Jaqueta', categoria_pai: 'VESTUARIO_CAMADA_EXTERNA' },
        { codigo: 'CAS', descricao: 'Casaco', categoria_pai: 'VESTUARIO_CAMADA_EXTERNA' },
        { codigo: 'COA', descricao: 'Sobretudo', categoria_pai: 'VESTUARIO_CAMADA_EXTERNA' },
        { codigo: 'BLA', descricao: 'Blazer', categoria_pai: 'VESTUARIO_CAMADA_EXTERNA' },
        // Calçados
        { codigo: 'TEN', descricao: 'Tênis', categoria_pai: 'CALCADO' },
        { codigo: 'SAP', descricao: 'Sapato', categoria_pai: 'CALCADO' },
        { codigo: 'BOT', descricao: 'Bota', categoria_pai: 'CALCADO' },
        { codigo: 'SAN', descricao: 'Sandália', categoria_pai: 'CALCADO' },
        { codigo: 'SLI', descricao: 'Slide / Chinelo', categoria_pai: 'CALCADO' },
        { codigo: 'OXF', descricao: 'Oxford', categoria_pai: 'CALCADO' },
        { codigo: 'MOC', descricao: 'Mocassim', categoria_pai: 'CALCADO' },
        { codigo: 'SCA', descricao: 'Scarpin', categoria_pai: 'CALCADO' },
        { codigo: 'ANI', descricao: 'Ankle boot', categoria_pai: 'CALCADO' },
        // Acessórios
        { codigo: 'BAG', descricao: 'Bolsa', categoria_pai: 'ACESSORIO' },
        { codigo: 'BEL', descricao: 'Cinto', categoria_pai: 'ACESSORIO' },
        { codigo: 'HAT', descricao: 'Chapéu / Boné', categoria_pai: 'ACESSORIO' },
        { codigo: 'JEW', descricao: 'Joia / Bijuteria', categoria_pai: 'ACESSORIO' },
        { codigo: 'WAT', descricao: 'Relógio', categoria_pai: 'ACESSORIO' },
        { codigo: 'SCA_ACC', descricao: 'Cachecol / Lenço', categoria_pai: 'ACESSORIO' },
        { codigo: 'GLA', descricao: 'Óculos', categoria_pai: 'ACESSORIO' },
        { codigo: 'TIE', descricao: 'Gravata', categoria_pai: 'ACESSORIO' }
    ],

    // ═══════════════════════════════════════════════════════════
    // LINHA (Gênero)
    // ═══════════════════════════════════════════════════════════
    LINHA: [
        { codigo: 'F', descricao: 'Feminina' },
        { codigo: 'M', descricao: 'Masculina' },
        { codigo: 'U', descricao: 'Unissex' }
    ],

    // ═══════════════════════════════════════════════════════════
    // CORES (Principais - expandir conforme necessidade)
    // ═══════════════════════════════════════════════════════════
    COR: [
        { codigo: 'PRT', descricao: 'Preto' },
        { codigo: 'BRA', descricao: 'Branco' },
        { codigo: 'CIN', descricao: 'Cinza' },
        { codigo: 'AZL', descricao: 'Azul' },
        { codigo: 'AZM', descricao: 'Azul Marinho' },
        { codigo: 'VRM', descricao: 'Vermelho' },
        { codigo: 'VRD', descricao: 'Verde' },
        { codigo: 'MAR', descricao: 'Marrom' },
        { codigo: 'BEG', descricao: 'Bege' },
        { codigo: 'ROX', descricao: 'Roxo' },
        { codigo: 'ROZ', descricao: 'Rosa' },
        { codigo: 'LAR', descricao: 'Laranja' },
        { codigo: 'AMA', descricao: 'Amarelo' },
        { codigo: 'OUR', descricao: 'Ouro' },
        { codigo: 'PRA', descricao: 'Prata' },
        { codigo: 'MUL', descricao: 'Multicolor' },
        { codigo: 'CST', descricao: 'Caramelo' },
        { codigo: 'VIN', descricao: 'Vinho' },
        { codigo: 'TUR', descricao: 'Turquesa' },
        { codigo: 'MNT', descricao: 'Menta' }
    ],

    // ═══════════════════════════════════════════════════════════
    // TAMANHO (Mapeamento comercial)
    // ═══════════════════════════════════════════════════════════
    TAMANHO: [
        { codigo: 'PP', descricao: 'Extra pequeno' },
        { codigo: 'P', descricao: 'Pequeno' },
        { codigo: 'M', descricao: 'Médio' },
        { codigo: 'G', descricao: 'Grande' },
        { codigo: 'GG', descricao: 'Extra grande' },
        { codigo: 'XS', descricao: 'XS' },
        { codigo: 'S', descricao: 'S' },
        { codigo: 'L', descricao: 'L' },
        { codigo: 'XL', descricao: 'XL' },
        { codigo: 'XXL', descricao: 'XXL' },
        // Números (calçado)
        { codigo: '33', descricao: 'Nº 33' },
        { codigo: '34', descricao: 'Nº 34' },
        { codigo: '35', descricao: 'Nº 35' },
        { codigo: '36', descricao: 'Nº 36' },
        { codigo: '37', descricao: 'Nº 37' },
        { codigo: '38', descricao: 'Nº 38' },
        { codigo: '39', descricao: 'Nº 39' },
        { codigo: '40', descricao: 'Nº 40' },
        { codigo: '41', descricao: 'Nº 41' },
        { codigo: '42', descricao: 'Nº 42' },
        // One size
        { codigo: 'OS', descricao: 'One Size' }
    ],

    // ═══════════════════════════════════════════════════════════
    // LAYER ROLE (Papel na composição)
    // ═══════════════════════════════════════════════════════════
    LAYER_ROLE: [
        { codigo: 'BASE', descricao: 'Base do look - peça que ancora o look' },
        { codigo: 'MID', descricao: 'Camada média - complemento estrutural' },
        { codigo: 'OUT', descricao: 'Camada externa - peça final/destaque' }
    ],

    // ═══════════════════════════════════════════════════════════
    // COLOR ROLE (Função da cor)
    // ═══════════════════════════════════════════════════════════
    COLOR_ROLE: [
        { codigo: 'NEUTRO', descricao: 'Cor neutra que harmoniza (preto, branco, cinza, bege)' },
        { codigo: 'DESTAQUE', descricao: 'Cor que chama atenção (vibrante ou contrastante)' }
    ],

    // ═══════════════════════════════════════════════════════════
    // FIT (Ajuste ao corpo)
    // ═══════════════════════════════════════════════════════════
    FIT: [
        { codigo: 'JUSTO', descricao: 'Ajustado ao corpo, realça formas' },
        { codigo: 'REGULAR', descricao: 'Segue a silhueta natural' },
        { codigo: 'SOLTO', descricao: 'Cai sobre o corpo sem aderir' },
        { codigo: 'OVERSIZE', descricao: 'Propositalmente maior que o tamanho' }
    ],

    // ═══════════════════════════════════════════════════════════
    // STYLE BASE (Base estética)
    // ═══════════════════════════════════════════════════════════
    STYLE_BASE: [
        { codigo: 'CASUAL', descricao: 'Estilo casual, descontraído' },
        { codigo: 'FORMAL', descricao: 'Estilo formal, elegante' },
        { codigo: 'SPORT', descricao: 'Estilo esportivo, ativo' },
        { codigo: 'CHIC', descricao: 'Estilo chic, sofisticado' }
    ],

    // ═══════════════════════════════════════════════════════════
    // SILHUETA (Para recomendação)
    // ═══════════════════════════════════════════════════════════
    SILHUETA: [
        { codigo: 'A', descricao: 'Silhueta A - ampla na base (quadris)' },
        { codigo: 'H', descricao: 'Silhueta H - proporções iguais' },
        { codigo: 'V', descricao: 'Silhueta V - invertida (ombros largos)' },
        { codigo: 'O', descricao: 'Silhueta O - arredondada (cintura)' }
    ],

    // ═══════════════════════════════════════════════════════════
    // COMPRIMENTO
    // ═══════════════════════════════════════════════════════════
    COMPRIMENTO: [
        { codigo: 'CURTA', descricao: 'Acima do joelho' },
        { codigo: 'REGULAR', descricao: 'Até o joelho ou meio da canela' },
        { codigo: 'LONGA', descricao: 'Até o tornozelo ou abaixo' }
    ],

    // ═══════════════════════════════════════════════════════════
    // POSIÇÃO DA CINTURA
    // ═══════════════════════════════════════════════════════════
    POSICAO_CINTURA: [
        { codigo: 'NATURAL', descricao: 'Na cintura natural do corpo' },
        { codigo: 'ALTO', descricao: 'Acima da cintura natural (cintura alta)' },
        { codigo: 'BAIXO', descricao: 'Abaixo da cintura natural' }
    ],

    // ═══════════════════════════════════════════════════════════
    // OCASIÃO
    // ═══════════════════════════════════════════════════════════
    OCASIAO: [
        { codigo: 'CASUAL', descricao: 'Uso casual, dia a dia' },
        { codigo: 'WORK', descricao: 'Trabalho / corporativo' },
        { codigo: 'NIGHT', descricao: 'Noite / festas' },
        { codigo: 'GYM', descricao: 'Academia / atividades físicas' },
        { codigo: 'FORMAL', descricao: 'Eventos formais' }
    ],

    // ═══════════════════════════════════════════════════════════
    // ESTAÇÃO
    // ═══════════════════════════════════════════════════════════
    ESTACAO: [
        { codigo: 'SPRING', descricao: 'Primavera' },
        { codigo: 'SUMMER', descricao: 'Verão' },
        { codigo: 'FALL', descricao: 'Outono' },
        { codigo: 'WINTER', descricao: 'Inverno' },
        { codigo: 'ALL', descricao: 'O ano todo' }
    ],

    // ═══════════════════════════════════════════════════════════
    // TEMPERATURA
    // ═══════════════════════════════════════════════════════════
    TEMPERATURA: [
        { codigo: 'COLD', descricao: 'Clima frio (até 15°C)' },
        { codigo: 'MILD', descricao: 'Clima ameno (15-25°C)' },
        { codigo: 'HOT', descricao: 'Clima quente (acima de 25°C)' }
    ],

    // ═══════════════════════════════════════════════════════════
    // MATERIAL
    // ═══════════════════════════════════════════════════════════
    MATERIAL: [
        { codigo: 'ALGODAO', descricao: 'Algodão - natural, respirável' },
        { codigo: 'POLIESTER', descricao: 'Poliéster - durável, fácil cuidado' },
        { codigo: 'VISCOSE', descricao: 'Viscose - macia, flui bem' },
        { codigo: 'ELASTANO', descricao: 'Elastano - flexível, retém forma' },
        { codigo: 'LINHO', descricao: 'Linho - natural, respirável' },
        { codigo: 'LA', descricao: 'Lã - quente, isolante' },
        { codigo: 'SEDA', descricao: 'Seda - luxuosa, brilho' },
        { codigo: 'DENIM', descricao: 'Denim - jeans, durável' }
    ],

    // ═══════════════════════════════════════════════════════════
    // ECO SCORE
    // ═══════════════════════════════════════════════════════════
    ECO_SCORE: [
        { codigo: 'EXCELLENT', descricao: 'Excelente impacto ambiental' },
        { codigo: 'GOOD', descricao: 'Bom impacto ambiental' },
        { codigo: 'MEDIUM', descricao: 'Impacto ambiental moderado' },
        { codigo: 'LOW', descricao: 'Impacto ambiental baixo' }
    ],

    // ═══════════════════════════════════════════════════════════
    // CARE LEVEL
    // ═══════════════════════════════════════════════════════════
    CARE_LEVEL: [
        { codigo: 'EASY', descricao: 'Cuidado fácil - lava tudo, seca na máquina' },
        { codigo: 'MEDIUM', descricao: 'Cuidado moderado - lava mão ou ciclo delicado' },
        { codigo: 'COMPLEX', descricao: 'Cuidado complexo - lavagem a seco ou especial' }
    ],

    // ═══════════════════════════════════════════════════════════
    // FAIXA DE PREÇO
    // ═══════════════════════════════════════════════════════════
    FAIXA_PRECO: [
        { codigo: 'BUDGET', descricao: 'Orçamento - acessível' },
        { codigo: 'STANDARD', descricao: 'Padrão - preço médio' },
        { codigo: 'PREMIUM', descricao: 'Premium - qualidade superior' },
        { codigo: 'LUXURY', descricao: 'Luxury - exclusivo, alto preço' }
    ]
};

export default Dicionario;
