import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['USER', 'SALESPERSON', 'STORE_ADMIN', 'SUPER_ADMIN', 'ANONYMOUS_USER'],
        default: 'USER'
    },
    lojaId: { // ID da loja para os papéis de SALESPERSON e STORE_ADMIN
        type: Schema.Types.ObjectId,
        ref: 'Loja',
        required: false
    },
    lojas_associadas: [ // ✅ NOVO: Array de lojas que o usuário é vendedor
        {
            type: Schema.Types.ObjectId,
            ref: 'Loja'
        }
    ],
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    nome: String,
    cpf: { // ✅ NOVO: Campo CPF opcional
        type: String,
        sparse: true, // permite múltiplos null/undefined - remove unique que está criando erro
        default: null
    },
    foto: String, // Foto do avatar (perfil)

    // ═══════════════════════════════════════════════════════════
    // 📏 MEDIDAS ANTROPOMÓRFICAS EXPANDIDAS (SKU_CLIENT)
    // ═══════════════════════════════════════════════════════════

    // Foto de corpo inteiro para referência da IA
    foto_corpo: {
        type: String,
        default: null // Será uma URL (do Cloudinary, S3 ou local)
    },

    // BASE: Dados físicos fundamentais
    sexo: {
        type: String,
        enum: ['feminino', 'masculino', 'outro', null],
        default: null
    },

    tipo_corpo: {
        type: String,
        enum: ['ampulheta', 'retangulo', 'pera', 'maca', 'triangulo-invertido', null],
        default: null,
        comment: "Classificação do tipo de corpo (sistema Vesttag)"
    },

    altura_cm: {
        type: Number,
        default: 0,
        comment: "Altura em centímetros"
    },

    // Medidas detalhadas (em cm)
    medidas: {
        busto: { type: Number, default: 0, comment: "Medida do busto em cm" },
        cintura: { type: Number, default: 0, comment: "Medida da cintura em cm" },
        quadril: { type: Number, default: 0, comment: "Medida do quadril em cm" },
        altura: { type: Number, default: 0, comment: "Altura em cm (duplicado por compatibilidade)" },
        peso_kg: { type: Number, default: 0, comment: "Peso em quilogramas" },

        // Novos campos antropomórficos
        pescoco: { type: Number, default: 0, comment: "Medida do pescoço em cm" },
        ombro: { type: Number, default: 0, comment: "Largura de ombro em cm" },
        braco: { type: Number, default: 0, comment: "Circunferência do braço em cm" },
        antebraco: { type: Number, default: 0, comment: "Circunferência do antebraço em cm" },
        pulso: { type: Number, default: 0, comment: "Circunferência do pulso em cm" },
        torax: { type: Number, default: 0, comment: "Medida do tórax em cm" },
        sobpeito: { type: Number, default: 0, comment: "Medida sob o peito em cm" },
        costelas: { type: Number, default: 0, comment: "Medida das costelas em cm" },
        panturrilha: { type: Number, default: 0, comment: "Circunferência da panturrilha em cm" },
        coxa: { type: Number, default: 0, comment: "Circunferência da coxa em cm" },
        tornozelo: { type: Number, default: 0, comment: "Circunferência do tornozelo em cm" },

        // Proporções
        comprimento_torso: { type: Number, default: 0, comment: "Comprimento do tronco em cm" },
        comprimento_perna: { type: Number, default: 0, comment: "Comprimento da perna em cm" },
        comprimento_braco: { type: Number, default: 0, comment: "Comprimento do braço em cm" }
    },

    // Proporções corporais (perfil de proporção)
    proporcoes: {
        pernas: {
            type: String,
            enum: ['curtas', 'balanced', 'longas', null],
            default: null,
            comment: "Proporção das pernas em relação ao corpo"
        },
        torso: {
            type: String,
            enum: ['curto', 'balanced', 'longo', null],
            default: null,
            comment: "Proporção do tronco"
        },
        ombros_vs_quadril: {
            type: String,
            enum: ['ombros_larcos', 'balanced', 'quadril_largo', null],
            default: null,
            comment: "Proporção entre ombros e quadril"
        },
        confidence: {
            type: Number,
            default: 0,
            comment: "Confiança da medição (0-1)"
        }
    },

    // Restrições e preferências de ajuste
    restricoes: {
        aversoes_ajuste: [
            {
                type: String,
                enum: [
                    'very_tight_on_arms',
                    'very_tight_on_chest',
                    'very_tight_on_waist',
                    'very_loose_on_arms',
                    'loose_in_torso',
                    'low_waist'
                ]
            }
        ],
        notas: {
            type: String,
            default: '',
            comment: "Notas adicionais sobre restrições pessoais"
        }
    },

    // LEARNED: Dados aprendidos pela IA com base em comportamento
    preferencias_aprendidas: {
        // Distribuição de estilos preferidos
        estilos: [
            {
                estilo: { type: String, enum: ['casual', 'formal', 'smart_casual', 'sportwear', 'classico', 'fashion'] },
                peso: { type: Number, default: 0, comment: "Peso/preferência (0-1)" }
            }
        ],

        // Distribuição de ajustes preferidos
        ajustes: [
            {
                ajuste: { type: String, enum: ['ajustado', 'regular', 'solto', 'oversize'] },
                peso: { type: Number, default: 0, comment: "Peso/preferência (0-1)" }
            }
        ],

        // Distribuição de paletas de cor
        paletas_cor: [
            {
                paleta: { type: String, enum: ['neutral', 'warm', 'cool', 'vibrant'] },
                peso: { type: Number, default: 0, comment: "Peso/preferência (0-1)" }
            }
        ],

        // Afinidade com categorias de produto
        afinidade_categorias: [
            {
                categoria: { type: String },
                score: { type: Number, default: 0, comment: "Score de afinidade (0-1)" }
            }
        ],

        // Afinidade com marcas
        afinidade_marcas: [
            {
                marca_id: { type: Schema.Types.ObjectId, ref: 'Marca' },
                score: { type: Number, default: 0, comment: "Score de afinidade (0-1)" }
            }
        ],

        // Sensibilidade de preço
        sensibilidade_preco: {
            moeda: { type: String, default: 'BRL' },
            faixa_tipica: {
                minimo: { type: Number, default: 0 },
                maximo: { type: Number, default: 0 }
            },
            confianca: { type: Number, default: 0, comment: "Confiança da estimativa (0-1)" }
        },

        // Estado de aprendizado
        estado_aprendizado: {
            total_sinais: { type: Number, default: 0, comment: "Quantidade de eventos de aprendizado" },
            ultimo_evento_em: { type: Date, default: null },
            estabilidade: { type: Number, default: 0, comment: "Estabilidade do padrão (0-1)" }
        }
    },

    // CONTEXT: Contexto da preferência atual
    contexto_atual: {
        ocasiao: {
            type: String,
            enum: ['casual', 'work', 'formal', 'sport', 'night', 'beach', null],
            default: null
        },
        localizacao: {
            pais: { type: String, default: 'BR' },
            cidade: { type: String, default: '' },
            timezone: { type: String, default: 'America/Sao_Paulo' }
        },
        clima: {
            temperatura_c: { type: Number, default: null },
            condicao: {
                type: String,
                enum: ['sunny', 'cloudy', 'rain', 'cold', 'hot', null],
                default: null
            },
            atualizado_em: { type: Date, default: null }
        },
        preferencias_agora: {
            nivel_formal: {
                type: String,
                enum: ['casual', 'smart_casual', 'business_casual', 'formal', null],
                default: null
            },
            prioridade_conforto: { type: Number, default: 0.5, comment: "0=Estética, 1=Conforto" }
        }
    },

    // Estilo pessoal (campo legado, mantido por compatibilidade)
    estilo_pessoal: {
        type: String,
        default: ''
    },

    // Data de última verificação de medidas
    medidas_verificadas_em: {
        type: Date,
        default: null
    },

    // ═══════════════════════════════════════════════════════════

    origem_cadastro: {
        type: String,
        default: 'local'
    },
    create_date: {
        type: Date,
        default: Date.now
    },

    // ═══════════════════════════════════════════════════════════
    // 👤 SESSÃO ANÔNIMA (para usuários não autenticados)
    // ═══════════════════════════════════════════════════════════

    // ID da sessão do navegador (gerado no frontend)
    sessionId: {
        type: String,
        sparse: true, // Permite múltiplos null
        index: true // Índice para buscar rápido
    },

    // Data de expiração da sessão anônima
    expiresAt: {
        type: Date,
        default: null,
        index: { expireAfterSeconds: 0 } // TTL index - auto-delete quando expirar
    },

    // Flag para indicar se é usuário anônimo
    isAnonymous: {
        type: Boolean,
        default: false,
        index: true
    }
});

// Use email as the username field for passport-local-mongoose
userSchema.plugin(passportLocalMongoose.default, { usernameField: 'email' });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', userSchema);

/**
 * Register a new user using passport-local-mongoose's register helper.
 * Returns the created user (without sensitive fields) or throws an error.
 */
export async function registerUser(email, password) {
    if (!email || !password) throw new Error('Missing email or password');

    const exists = await Usuario.findOne({ email }).exec();
    if (exists) {
        const err = new Error('User already exists');
        err.code = 'USER_EXISTS';
        throw err;
    }

    return new Promise((resolve, reject) => {
        Usuario.register(new Usuario({ email }), password, (err, user) => {
            if (err) return reject(err);
            // Remove passport-local-mongoose fields if present
            const safe = {
                id: user._id,
                email: user.email,
            };
            resolve(safe);
        });
    });
}

export default Usuario;