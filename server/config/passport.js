import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Usuario from '../models/UsuarioModel.js';

// Estratégia Local (mantém como está)
export function initPassport() {
    console.log("Inicializando Passport...");

    // Carrega as variáveis de ambiente
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const backendUrl = process.env.BACKEND_URL;

    console.log("GOOGLE_CLIENT_ID:", googleClientId ? "✅ Carregado" : "❌ NÃO ENCONTRADO");
    console.log("GOOGLE_CLIENT_SECRET:", googleClientSecret ? "✅ Carregado" : "❌ NÃO ENCONTRADO");

    if (!googleClientId || !googleClientSecret) {
        throw new Error('Credenciais do Google não configuradas no .env');
    }

    passport.use(Usuario.createStrategy());

    // Estratégia Google
    const callbackURL = backendUrl
        ? `${backendUrl}/auth/google/callback`
        : 'http://localhost:3000/auth/google/callback';

    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
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

    console.log("✅ Passport inicializado com sucesso");
}

export default passport;