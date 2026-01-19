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
        enum: ['USER', 'SALESPERSON', 'STORE_ADMIN', 'SUPER_ADMIN'],
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
        sparse: true, // permite múltiplos null/undefined
        default: null
    },
    foto: String, // Foto do avatar (perfil)

    // --- NOVOS CAMPOS PARA O STYLEME AI ---

    // Foto de corpo inteiro para referência da IA
    foto_corpo: {
        type: String,
        default: null // Será uma URL (do Cloudinary, S3 ou local)
    },

    // Dados físicos para os cálculos de geometria vestimentar
    tipo_corpo: {
        type: String,
        enum: ['ampulheta', 'retangulo', 'pera', 'maca', 'triangulo-invertido', null],
        default: null
    },

    estilo_pessoal: {
        type: String,
        default: ''
    },

    medidas: {
        busto: { type: Number, default: 0 },
        cintura: { type: Number, default: 0 },
        quadril: { type: Number, default: 0 },
        altura: { type: Number, default: 0 } // em cm
    },
    // ---------------------------------------

    origem_cadastro: {
        type: String,
        default: 'local'
    },
    create_date: {
        type: Date,
        default: Date.now
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