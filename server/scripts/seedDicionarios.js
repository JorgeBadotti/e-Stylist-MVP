/**
 * SEED - Dicionários STYLEME v1
 * 
 * Execução:
 * node scripts/seedDicionarios.js
 * 
 * Remove dicionários antigos e popula com dados oficiais v1
 */

import mongoose from 'mongoose';
import Dicionario, { DICIONARIOS_STYLEME_V1 } from '../models/DicionarioStyleMe.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedDicionarios() {
    try {
        // Conectar ao banco (especificando o database name como em db.js)
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB,
        });

        console.log('✅ Conectado ao MongoDB');

        // Limpar dicionários antigos (drop completo da coleção)
        try {
            await Dicionario.collection.drop();
            console.log('🗑️  Coleção "dicionarios_styleme" dropada');
        } catch (err) {
            console.log('ℹ️  Coleção não existia ainda');
        }

        // Preparar documentos para inserção
        const documentosParaInserir = [];

        Object.entries(DICIONARIOS_STYLEME_V1).forEach(([tipo, valores]) => {
            valores.forEach(valor => {
                documentosParaInserir.push({
                    tipo,
                    codigo: valor.codigo,
                    descricao: valor.descricao,
                    categoria_pai: valor.categoria_pai || null,
                    version: '1.0',
                    status: 'ATIVO'
                });
            });
        });

        console.log(`\n📊 Inserindo ${documentosParaInserir.length} dicionários...`);

        // Inserir em batch (mais rápido)
        const resultado = await Dicionario.insertMany(documentosParaInserir, {
            ordered: false
        });

        console.log(`✅ ${resultado.length} dicionários inseridos com sucesso!\n`);

        // Estatísticas por tipo
        const stats = {};
        documentosParaInserir.forEach(doc => {
            stats[doc.tipo] = (stats[doc.tipo] || 0) + 1;
        });

        console.log('📈 Resumo por tipo:');
        console.log('─'.repeat(40));
        Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([tipo, count]) => {
                console.log(`${tipo.padEnd(25)} ${count.toString().padStart(3)} valores`);
            });
        console.log('─'.repeat(40));
        console.log(`Total: ${documentosParaInserir.length} valores`);

        // Verificação final
        console.log('\n🔍 Verificação final:');
        const countPorTipo = await Dicionario.aggregate([
            { $group: { _id: '$tipo', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        let totalVerificado = 0;
        countPorTipo.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
            totalVerificado += item.count;
        });
        console.log(`\n✅ Total verificado: ${totalVerificado}`);

        // Exemplos
        console.log('\n📚 Exemplos de dados inseridos:');
        console.log('─'.repeat(40));
        const exemplos = await Dicionario.find({}).limit(5);
        exemplos.forEach(doc => {
            console.log(`${doc.tipo}: ${doc.codigo} = "${doc.descricao}"`);
        });

        console.log('\n✨ Seed completado com sucesso!');
        
        // Desconectar do banco
        await mongoose.connection.close();
        console.log('✅ Conexão fechada');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao fazer seed dos dicionários:');
        console.error(error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Executar
seedDicionarios();
