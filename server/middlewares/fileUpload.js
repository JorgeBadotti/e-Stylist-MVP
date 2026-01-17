import multer from 'multer';

// Configura o armazenamento em memória (RAM) temporária
// O arquivo não será salvo no disco do servidor, vai direto pro Cloudinary
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

// Wrapper para tratar erros do multer
export const uploadWrapper = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (err) {
            console.error(`❌ [fileUpload] Erro ao fazer upload: ${err.message}`);
            return res.status(400).json({
                message: 'Erro ao processar arquivo',
                error: err.message
            });
        }
        next();
    });
};

export default upload;