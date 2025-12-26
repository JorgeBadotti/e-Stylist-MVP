import Usuario from '../models/UsuarioModel.js';

export const loginEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Aqui entraria sua lógica de busca no banco e validação de hash de senha
        const user = await Usuario.findOne({ email });

        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        res.status(200).json({ message: 'Login realizado com sucesso', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const googleCallback = (req, res) => {
    // Após o Google autenticar, ele cai aqui
    // Geralmente redirecionamos para o dashboard do frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};