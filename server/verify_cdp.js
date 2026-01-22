import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from './models/UsuarioModel.js';
import CognitiveProfileService from './services/CognitiveProfileService.js';
import Evento from './models/Evento.js';

dotenv.config();

async function runVerification() {
    console.log("🔵 Iniciando verificação CDP...");

    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI não definida.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado ao MongoDB");

        // 1. Criar usuário de teste
        const testEmail = `cdp_test_${Date.now()}@example.com`;
        const user = new Usuario({
            email: testEmail,
            nome: "CDP Tester",
            preferencias_aprendidas: { estilos: [] }
        });
        await user.save();
        console.log(`✅ Usuário de teste criado: ${user._id}`);

        // 2. Simular Evento: LIKE em look "boho"
        console.log("🔵 Enviando evento LIKE em look 'boho'...");
        await CognitiveProfileService.trackEvent(user._id, 'like_look', {
            lookId: 'mock_look_1',
            style: 'boho'
        });

        // Pequeno delay para garantir que o async do service rodou
        await new Promise(r => setTimeout(r, 1000));

        // 3. Verificar Perfil
        let updatedUser = await Usuario.findById(user._id);
        let bohoStyle = updatedUser.preferencias_aprendidas.estilos.find(e => e.estilo === 'boho');

        console.log("🧐 Verificando peso 'boho' após like...");
        if (bohoStyle && bohoStyle.peso > 0.1) {
            console.log(`✅ SUCESSO: Peso 'boho' aumentou para ${bohoStyle.peso}`);
        } else {
            console.error(`❌ FALHA: Peso 'boho' não subiu como esperado. Valor: ${bohoStyle?.peso}`);
        }

        // 4. Simular Evento: REJECT em look "boho"
        console.log("🔵 Enviando evento REJECT em look 'boho'...");
        await CognitiveProfileService.trackEvent(user._id, 'reject_look', {
            lookId: 'mock_look_2',
            style: 'boho'
        });

        await new Promise(r => setTimeout(r, 1000));

        updatedUser = await Usuario.findById(user._id);
        let bohoStyleAfterReject = updatedUser.preferencias_aprendidas.estilos.find(e => e.estilo === 'boho');

        console.log("🧐 Verificando peso 'boho' após reject...");
        if (bohoStyleAfterReject.peso < bohoStyle.peso) {
            console.log(`✅ SUCESSO: Peso 'boho' caiu para ${bohoStyleAfterReject.peso}`);
        } else {
            console.error(`❌ FALHA: Peso 'boho' não caiu. Valor: ${bohoStyleAfterReject?.peso}`);
        }

        // 5. Testar Contexto Inteligente
        const context = await CognitiveProfileService.getSmartContext(user._id);
        console.log("🧠 Contexto Gerado:", context);

        // Limpeza
        await Usuario.deleteOne({ _id: user._id });
        await Evento.deleteMany({ userId: user._id });
        console.log("🧹 Dados de teste limpos.");

    } catch (err) {
        console.error("❌ Erro fatal:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

runVerification();
