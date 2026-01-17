/**
 * VERIFY - Simples verificação de dicionários no banco
 */

import mongoose from 'mongoose';
import Dicionario from '../models/DicionarioStyleMe.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyDicionarios() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB,
        });
        console.log('✅ Conectado ao MongoDB');

        const count = await Dicionario.countDocuments();
        
        console.log(`\n📊 Total de documentos na coleção 'dicionarios': ${count}`);

        if (count === 0) {
            console.log('❌ NENHUM DICIONÁRIO ENCONTRADO!');
        } else {
            console.log('✅ Dicionários existem no banco!');
            
            // Mostrar alguns exemplos
            const exemplo = await Dicionario.findOne();
            if (exemplo) {
                console.log('\n📋 Exemplo de documento:');
                console.log(exemplo);
            }
        }

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

verifyDicionarios();
