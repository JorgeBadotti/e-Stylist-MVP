import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// 1. Função explícita para iniciar a configuração
// Vamos chamar ela lá no app.js
export const configCloudinary = () => {
    // Pega as variáveis que você acabou de criar no .env
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Validação de segurança: Se faltar alguma, avisa no terminal
    if (!cloudName || !apiKey || !apiSecret) {
        console.error("❌ ERRO: Faltam variáveis do Cloudinary no .env");
        console.error("Verifique: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        throw new Error("Configuração do Cloudinary incompleta.");
    }

    // Configuração Explícita (A mais segura possível)
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });

    console.log("✅ Cloudinary conectado com sucesso (Variáveis Separadas).");
};

// 2. Função de Upload (Mantém igual, mas sem lógica de config dentro)
export const uploadImage = (buffer, folder = 'estylist-geral') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    console.error('Erro no Cloudinary:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// 3. Função de Delete (Mantém igual)
export const deleteImage = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Erro ao deletar imagem:', error);
    }
};

export default cloudinary;