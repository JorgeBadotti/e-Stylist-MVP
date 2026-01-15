import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Usuario from '../models/UsuarioModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Estratégia Local (mantém como está)
passport.use(Usuario.createStrategy());

// Estratégia Google (AQUI ESTÁ A LÓGICA QUE VOCÊ QUER)
const callbackURL = process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}/auth/google/callback`
    : 'http://localhost:3000/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
},
    async (accessToken, refreshToken, profile, cb) => {
        try {
            // 1. Tenta achar pelo Google ID (usuário já logou com Google antes?)
            let user = await Usuario.findOne({ googleId: profile.id });

            if (user) {
                // Usuário encontrado via Google ID, retorna ele.
                return cb(null, user);
            }

            // 2. Se não achou pelo ID, verifica se o E-MAIL já existe no banco
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await Usuario.findOne({ email });

                if (user) {
                    // O usuário existe (criou conta local antes), mas é a primeira vez com Google.
                    // Vamos VINCULAR a conta Google a este usuário existente.
                    user.googleId = profile.id;
                    // Opcional: Atualizar foto/nome se estiverem vazios
                    if (!user.nome) user.nome = profile.displayName;
                    if (!user.foto) user.foto = profile.photos?.[0]?.value;

                    await user.save();
                    return cb(null, user);
                }
            }

            // 3. Usuário NÃO existe: CRIAR NOVA CONTA (Auto-Registration)
            // Equivalente ao `UsuarioModel.registrar(novo_usuario)` do Python
            const newUser = new Usuario({
                googleId: profile.id,
                email: email,
                nome: profile.displayName,
                foto: profile.photos?.[0]?.value,
                origem_cadastro: 'google'
                // Não definimos senha aqui. O passaport-local-mongoose lida com login sem senha.
            });

            await newUser.save();
            return cb(null, newUser);

        } catch (err) {
            return cb(err, null);
        }
    }
));

// Serialização (necessário para sessão)
passport.serializeUser(Usuario.serializeUser());
passport.deserializeUser(Usuario.deserializeUser());

export default passport;