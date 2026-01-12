import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // ID único do Google (importante para logins futuros)
    googleId: {
        type: String,
        unique: true,
        sparse: true // Permite que seja null (para quem cria conta com senha)
    },
    // Campos adicionais que vêm do Google
    nome: String,
    foto: String,
    origem_cadastro: {
        type: String,
        default: 'local' // 'local' ou 'google'
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(passportLocalMongoose.default, { usernameField: 'email' });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', userSchema);

export default Usuario;