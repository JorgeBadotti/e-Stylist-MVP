import mongoose from 'mongoose';

const { Schema } = mongoose;

const produtoSchema = new Schema({
    // ═══════════════════════════════════════════════════════════
    // 🔑 SKU STYLEME v1 - IDENTIDADE DA PEÇA
    // ═══════════════════════════════════════════════════════════

    // Código SKU visível: [CATEGORIA]-[LINHA]-[COR]-[TAMANHO]-[SEQ]-[COLECAO]
    // Exemplo: CAM-F-PRT-M-023-F24
    skuStyleMe: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        pattern: /^[A-Z]{3}-[A-Z]-[A-Z]{3}-[A-Z0-9]{1,2}-\d{3}-[A-Z]\d{2}$/,
        comment: "Código SKU único gerado automaticamente: CATEGORIA-LINHA-COR-TAMANHO-SEQ-COLECAO"
    },

    // Componentes do SKU (para busca e filtros)
    categoria: {
        type: String,
        required: true,
        enum: [
            // Vestuário - Superior
            'CAM', 'SHI', 'TOP', 'SWE',
            // Vestuário - Inferior
            'CAL', 'JEA', 'SAI', 'SHO', 'BER',
            // Vestuário - Peça Única
            'VES', 'MAC',
            // Vestuário - Camada Externa
            'JKT', 'CAS', 'COA', 'BLA',
            // Calçados
            'TEN', 'SAP', 'BOT', 'SAN', 'SLI', 'OXF', 'MOC', 'SCA', 'ANI',
            // Acessórios
            'BAG', 'BEL', 'HAT', 'JEW', 'WAT', 'SCA_ACC', 'GLA', 'TIE'
        ],
        comment: "Categoria da peça (ex: CAM = Camiseta)"
    },

    linha: {
        type: String,
        required: true,
        enum: ['F', 'M', 'U'],
        comment: "Linha de gênero: F (Feminina), M (Masculina), U (Unissex)"
    },

    cor_codigo: {
        type: String,
        required: true,
        trim: true,
        comment: "Código da cor (ex: PRT = Preto, AZL = Azul)"
    },

    tamanho: {
        type: String,
        required: true,
        comment: "Tamanho da peça (ex: M, P, 40, etc)"
    },

    sequencia: {
        type: String,
        required: true,
        comment: "Número sequencial de identidade (ex: 023)"
    },

    colecao: {
        type: String,
        required: true,
        enum: ['S24', 'S25', 'F24', 'F25', 'P24', 'P25'],
        comment: "Coleção (ex: F24 = Fall 2024)"
    },

    // ═══════════════════════════════════════════════════════════
    // 🧠 NÚCLEO DE COMBINAÇÃO (Obrigatório)
    // Sem isso, IA não combina e look quebra
    // ═══════════════════════════════════════════════════════════

    layer_role: {
        type: String,
        required: true,
        enum: ['BASE', 'MID', 'OUT'],
        comment: "Papel na composição: BASE (base), MID (camada média), OUT (camada externa)"
    },

    color_role: {
        type: String,
        required: true,
        enum: ['NEUTRO', 'DESTAQUE'],
        comment: "Função da cor: NEUTRO (harmoniza), DESTAQUE (chama atenção)"
    },

    fit: {
        type: String,
        required: true,
        enum: ['JUSTO', 'REGULAR', 'SOLTO', 'OVERSIZE'],
        comment: "Ajuste da peça ao corpo"
    },

    style_base: {
        type: String,
        required: true,
        enum: ['CASUAL', 'FORMAL', 'SPORT', 'CHIC'],
        comment: "Base estética da peça"
    },

    // ═══════════════════════════════════════════════════════════
    // 📐 RECOMENDADOS (Melhoram inteligência)
    // ═══════════════════════════════════════════════════════════

    silhueta: {
        type: String,
        enum: ['A', 'H', 'V', 'O'],
        comment: "Silhueta: A (trapézio), H (reta), V (invertida), O (arredondada)"
    },

    comprimento: {
        type: String,
        enum: ['CURTA', 'REGULAR', 'LONGA'],
        comment: "Comprimento da peça"
    },

    posicao_cintura: {
        type: String,
        enum: ['NATURAL', 'ALTO', 'BAIXO'],
        comment: "Onde a cintura da peça senta no corpo"
    },

    ocasiao: {
        type: String,
        enum: ['CASUAL', 'WORK', 'NIGHT', 'GYM', 'FORMAL'],
        comment: "Ocasião de uso recomendada"
    },

    estacao: {
        type: String,
        enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL'],
        comment: "Estação recomendada"
    },

    temperatura: {
        type: String,
        enum: ['COLD', 'MILD', 'HOT', 'ALL'],
        comment: "Faixa de temperatura recomendada"
    },

    // ═══════════════════════════════════════════════════════════
    // 🎨 OPCIONAIS (Upgrade de inteligência)
    // ═══════════════════════════════════════════════════════════

    material_principal: {
        type: String,
        enum: ['ALGODAO', 'POLIESTER', 'VISCOSE', 'ELASTANO', 'LINHO', 'LÃ', 'SEDA', 'DENIM'],
        comment: "Material principal"
    },

    eco_score: {
        type: String,
        enum: ['EXCELLENT', 'GOOD', 'MEDIUM', 'LOW'],
        comment: "Pontuação ambiental"
    },

    care_level: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'COMPLEX'],
        comment: "Complexidade de cuidado"
    },

    faixa_preco: {
        type: String,
        enum: ['BUDGET', 'STANDARD', 'PREMIUM', 'LUXURY'],
        comment: "Faixa de preço"
    },

    peca_hero: {
        type: Boolean,
        default: false,
        comment: "É uma peça destaque da coleção?"
    },

    classe_margem: {
        type: String,
        enum: ['LOW', 'NORMAL', 'HIGH'],
        comment: "Classe de margem esperada"
    },

    // ═══════════════════════════════════════════════════════════
    // 📝 DADOS TÉCNICOS
    // ═══════════════════════════════════════════════════════════

    nome: {
        type: String,
        required: true,
        trim: true,
        comment: "Nome comercial da peça"
    },

    descricao: {
        type: String,
        comment: "Descrição detalhada"
    },

    foto: {
        type: String,
        default: '',
        comment: "URL da foto no Cloudinary"
    },

    fotoPublicId: {
        type: String,
        select: false,
        comment: "ID da foto no Cloudinary (para deleção)"
    },

    // ═══════════════════════════════════════════════════════════
    // 🔗 RELACIONAMENTOS
    // ═══════════════════════════════════════════════════════════

    guardaRoupaId: {
        type: Schema.Types.ObjectId,
        ref: 'GuardaRoupa',
        default: null,
        comment: "Coleção do usuário (se for roupa pessoal)"
    },

    lojaId: {
        type: Schema.Types.ObjectId,
        ref: 'Loja',
        default: null,
        comment: "Loja (se for produto comercial)"
    },

    status: {
        type: String,
        enum: ['DRAFT', 'ATIVO', 'DESCONTINUADO'],
        default: 'ATIVO',
        comment: "Status do SKU"
    },

    versao: {
        type: String,
        default: '1.0',
        comment: "Versão do SKU (para retrocompatibilidade)"
    }

}, {
    timestamps: true,
    collection: 'produtos'
});

// ═══════════════════════════════════════════════════════════
// ÍNDICES
// ═══════════════════════════════════════════════════════════
produtoSchema.index({ categoria: 1, linha: 1 });
produtoSchema.index({ guardaRoupaId: 1 });
produtoSchema.index({ lojaId: 1 });
produtoSchema.index({ layer_role: 1, color_role: 1 }); // Para combinação
produtoSchema.index({ ocasiao: 1, estacao: 1 }); // Para recomendação

// ═══════════════════════════════════════════════════════════
// VALIDAÇÕES
// ═══════════════════════════════════════════════════════════
produtoSchema.pre('save', async function () {
    // Validar que pelo menos um de guardaRoupaId ou lojaId está preenchido
    if (!this.guardaRoupaId && !this.lojaId) {
        throw new Error('Produto deve estar associado a um GuardaRoupa ou Loja');
    }
});

const Produto = mongoose.models.Produto || mongoose.model('Produto', produtoSchema);

export default Produto;
