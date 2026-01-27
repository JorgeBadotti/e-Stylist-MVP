import express from 'express';
import {
    createProduto,
    getProdutosByGuardaRoupa,
    getProdutosByLoja,
    getProdutoPorSKU,
    updateProduto,
    deleteProduto,
    getDicionarios,
    getTodosDicionarios,
    sugerirSKU,
    getProdutosDisponiveisParaGuardaRoupa
} from '../controllers/produtoController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import upload, { uploadWrapper, uploadMultipleWrapper } from '../middlewares/fileUpload.js';
import { analisarImagemProduto } from '../services/gemini.js';
import { uploadImage } from '../services/cloudinary.js';
import Produto from '../models/Produto.js';
import { gerarSKUStyleMe, verificarDuplicataSKU } from '../utils/skuStyleMeUtils.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// DICIONÁRIOS STYLEME (sem autenticação, dados públicos)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/produtos/dicionarios/todos
 * Obter TODOS os dicionários SKU STYLEME em uma única requisição (otimizado)
 */
router.get('/dicionarios/todos', getTodosDicionarios);

/**
 * GET /api/produtos/dicionarios/?tipo=CATEGORIA
 * Obter dicionários SKU STYLEME por tipo (público, sem autenticação)
 */
router.get('/dicionarios/', getDicionarios);

/**
 * GET /api/produtos/sku-sugestao?categoria=CAM&colecao=F24
 * Obter sugestão de próximo SKU (público, sem autenticação)
 */
router.get('/sku-sugestao/', sugerirSKU);

/**
 * GET /api/produtos/:sku
 * Obter detalhes de um produto pelo SKU STYLEME (público, sem autenticação)
 */
router.get('/:sku', getProdutoPorSKU);

// Aplicar autenticação em todas as rotas abaixo deste ponto
router.use(isAuthenticated);

// ═══════════════════════════════════════════════════════════
// CRUD PRODUTOS
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/produtos
 * Criar um novo Produto com SKU STYLEME v1
 */
router.post('/', uploadWrapper('foto'), createProduto);

/**
 * POST /api/produtos/lotes/imagens
 * Cadastrar produtos em lotes através de imagens
 * Análise automática de imagens com Gemini para extração de dados
 * Retorna evento a evento (streaming de progresso)
 */
router.post('/lotes/imagens', uploadMultipleWrapper('imagens', 50), async (req, res) => {
    try {
        console.log('📸 [ProdutoRouter] Recebido requisição POST /lotes/imagens');
        console.log('📊 Arquivos recebidos:', req.files?.length || 0);
        console.log('🏪 lojaId:', req.body.lojaId);

        const { lojaId } = req.body;
        if (!lojaId) {
            return res.status(400).json({
                message: 'lojaId é obrigatório'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'Nenhuma imagem foi enviada'
            });
        }

        // Configurar headers para streaming de eventos
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');

        const produtosSalvos = [];
        const errosGerais = [];

        // Processar cada imagem
        for (let i = 0; i < req.files.length; i++) {
            const arquivo = req.files[i];
            const numeroPeca = i + 1;
            const totalPecas = req.files.length;

            try {
                // 🔔 EVENTO 1: Iniciando análise
                res.write(JSON.stringify({
                    tipo: 'iniciando',
                    numeroPeca,
                    totalPecas,
                    nomeArquivo: arquivo.originalname,
                    timestamp: new Date().toISOString()
                }) + '\n');

                console.log(`\n🔍 [ProdutoRouter] Analisando imagem ${numeroPeca}/${totalPecas}: ${arquivo.originalname}`);

                const imagemBuffer = arquivo.buffer;
                const mimeType = arquivo.mimetype || 'image/jpeg';

                // 🔔 EVENTO 2: Analisando com IA
                res.write(JSON.stringify({
                    tipo: 'analisando_ia',
                    numeroPeca,
                    totalPecas,
                    status: 'Analisando imagem com IA...'
                }) + '\n');

                // Analisar imagem com Gemini
                const dadosProduto = await analisarImagemProduto(imagemBuffer, mimeType);
                dadosProduto.lojaId = lojaId;

                // 🔔 EVENTO 3: Gerando SKU
                res.write(JSON.stringify({
                    tipo: 'gerando_sku',
                    numeroPeca,
                    totalPecas,
                    status: 'Gerando SKU...'
                }) + '\n');

                let skuGerado;
                try {
                    skuGerado = await gerarSKUStyleMe({
                        categoria: dadosProduto.categoria,
                        linha: dadosProduto.linha,
                        cor_codigo: dadosProduto.cor_codigo,
                        tamanho: dadosProduto.tamanho,
                        colecao: dadosProduto.colecao
                    }, Produto);

                    const temDuplicata = await verificarDuplicataSKU(skuGerado.skuStyleMe, Produto);
                    if (temDuplicata) {
                        throw new Error(`SKU ${skuGerado.skuStyleMe} já existe no banco de dados`);
                    }

                    dadosProduto.skuStyleMe = skuGerado.skuStyleMe;
                    dadosProduto.sequencia = skuGerado.sequencia;

                    console.log(`✅ SKU STYLEME gerado: ${skuGerado.skuStyleMe}`);
                } catch (erroSku) {
                    throw new Error(`Erro ao gerar SKU: ${erroSku.message}`);
                }

                // 🔔 EVENTO 4: Enviando para Cloudinary
                res.write(JSON.stringify({
                    tipo: 'enviando_cloudinary',
                    numeroPeca,
                    totalPecas,
                    status: 'Enviando para Cloudinary...',
                    sku: dadosProduto.skuStyleMe
                }) + '\n');

                let foto = '';
                let fotoPublicId = '';

                if (arquivo && arquivo.buffer) {
                    try {
                        console.log(`📸 [Cloudinary] Fazendo upload da foto: ${arquivo.originalname}`);
                        const uploadResult = await uploadImage(arquivo.buffer, 'produtos');
                        foto = uploadResult.secure_url;
                        fotoPublicId = uploadResult.public_id;
                        console.log(`✅ [Cloudinary] Foto enviada com sucesso!`);
                    } catch (erroCloudinary) {
                        console.error(`⚠️  [Cloudinary] Erro ao fazer upload da foto:`, erroCloudinary.message);
                    }
                }

                dadosProduto.foto = foto;
                dadosProduto.fotoPublicId = fotoPublicId;

                // 🔔 EVENTO 5: Salvando no banco
                res.write(JSON.stringify({
                    tipo: 'salvando_banco',
                    numeroPeca,
                    totalPecas,
                    status: 'Salvando no banco de dados...',
                    sku: dadosProduto.skuStyleMe
                }) + '\n');

                const novoProduto = new Produto(dadosProduto);
                const produtoSalvo = await novoProduto.save();

                console.log(`✅ [Database] Produto salvo com sucesso! ID: ${produtoSalvo._id}`);

                // 🔔 EVENTO 6: Sucesso!
                res.write(JSON.stringify({
                    tipo: 'sucesso',
                    numeroPeca,
                    totalPecas,
                    status: 'Peça concluída com sucesso! ✅',
                    sku: produtoSalvo.skuStyleMe,
                    produto: {
                        _id: produtoSalvo._id,
                        skuStyleMe: produtoSalvo.skuStyleMe,
                        categoria: produtoSalvo.categoria,
                        lojaId: produtoSalvo.lojaId,
                        foto: produtoSalvo.foto
                    }
                }) + '\n');

                produtosSalvos.push(produtoSalvo);
            } catch (erro) {
                console.error(`❌ Erro ao processar produto ${numeroPeca}:`, erro.message);

                // 🔔 EVENTO X: Erro
                res.write(JSON.stringify({
                    tipo: 'erro',
                    numeroPeca,
                    totalPecas,
                    status: 'Erro ao processar peça ❌',
                    erro: erro.message,
                    nomeArquivo: arquivo.originalname
                }) + '\n');

                errosGerais.push({
                    imagem: arquivo.originalname,
                    numeroPeca,
                    erro: erro.message
                });
            }
        }

        // 🔔 EVENTO FINAL: Resumo
        res.write(JSON.stringify({
            tipo: 'concluido',
            resumo: {
                totalImagens: req.files.length,
                produtosSalvos: produtosSalvos.length,
                erros: errosGerais.length
            },
            status: 'Processamento concluído!',
            timestamp: new Date().toISOString()
        }) + '\n');

        res.end();
    } catch (erro) {
        console.error('❌ [ProdutoRouter] Erro ao processar lotes de imagens:', erro);
        res.status(500).json({
            message: 'Erro ao processar imagens',
            erro: erro.message
        });
    }
});

/**
 * GET /api/produtos/guarda-roupa/:guardaRoupaId
 * Obter produtos de um GuardaRoupa
 */
router.get('/guarda-roupa/:guardaRoupaId', getProdutosByGuardaRoupa);

/**
 * GET /api/produtos/disponiveis/:guardaRoupaId
 * Obter produtos DISPONÍVEIS para serem adicionados a um GuardaRoupa
 */
router.get('/disponiveis/:guardaRoupaId', isAuthenticated, getProdutosDisponiveisParaGuardaRoupa);

/**
 * GET /api/produtos/loja/:lojaId
 * Obter produtos de uma Loja
 */
router.get('/loja/:lojaId', getProdutosByLoja);

/**
 * PUT /api/produtos/:id
 * Atualizar um Produto
 */
router.put('/:id', uploadWrapper('foto'), updateProduto);

/**
 * DELETE /api/produtos/:id
 * Deletar um Produto
 */
router.delete('/:id', deleteProduto);

export default router;
