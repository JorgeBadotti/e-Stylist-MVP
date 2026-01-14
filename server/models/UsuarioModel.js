import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    nome: String,
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

userSchema.plugin(passportLocalMongoose.default, { usernameField: 'email' });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', userSchema);

export default Usuario;