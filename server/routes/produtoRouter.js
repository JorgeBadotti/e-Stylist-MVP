import express from 'express';
import {
    createProduto,
    getProdutosByGuardaRoupa,
    getProdutosByLoja,
    updateProduto,
    deleteProduto,
    getDicionarios,
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
 * GET /api/produtos/dicionarios/?tipo=CATEGORIA
 * Obter dicionários SKU STYLEME (público, sem autenticação)
 */
router.get('/dicionarios/', getDicionarios);

/**
 * GET /api/produtos/sku-sugestao?categoria=CAM&colecao=F24
 * Obter sugestão de próximo SKU (público, sem autenticação)
 */
router.get('/sku-sugestao/', sugerirSKU);

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

        const produtosAnalysados = [];
        const produtosSalvos = [];
        const errosAnalise = [];
        const errosSalvamento = [];

        // Processar cada imagem
        for (let i = 0; i < req.files.length; i++) {
            const arquivo = req.files[i];
            try {
                console.log(`\n🔍 [ProdutoRouter] Analisando imagem ${i + 1}/${req.files.length}: ${arquivo.originalname}`);

                // Com memoryStorage(), o arquivo já está em buffer (não em disco)
                const imagemBuffer = arquivo.buffer;

                // Determinar mime type
                const mimeType = arquivo.mimetype || 'image/jpeg';

                // Analisar imagem com Gemini
                const dadosProduto = await analisarImagemProduto(imagemBuffer, mimeType);

                // Adicionar lojaId aos dados
                dadosProduto.lojaId = lojaId;

                // GERAR SKU STYLEME (mesmo processo do modo manual)
                // A IA preencheu apenas os componentes (categoria, linha, cor_codigo, tamanho, colecao)
                // Agora geramos o SKU e a sequencia automaticamente
                let skuGerado;
                try {
                    skuGerado = await gerarSKUStyleMe({
                        categoria: dadosProduto.categoria,
                        linha: dadosProduto.linha,
                        cor_codigo: dadosProduto.cor_codigo,
                        tamanho: dadosProduto.tamanho,
                        colecao: dadosProduto.colecao
                        // sequencia: NÃO fornecido - será gerado automaticamente por gerarSKUStyleMe
                    }, Produto);

                    // Verificar se SKU já existe
                    const temDuplicata = await verificarDuplicataSKU(skuGerado.skuStyleMe, Produto);
                    if (temDuplicata) {
                        throw new Error(`SKU ${skuGerado.skuStyleMe} já existe no banco de dados`);
                    }

                    // Preencher os dados com componentes do SKU gerado
                    // gerarSKUStyleMe agora retorna um objeto com todos os campos
                    dadosProduto.skuStyleMe = skuGerado.skuStyleMe;
                    dadosProduto.sequencia = skuGerado.sequencia;

                    console.log(`✅ SKU STYLEME gerado: ${skuGerado.skuStyleMe}`);
                    console.log(`🔑 Sequencia preenchida: ${skuGerado.sequencia}`);
                } catch (erroSku) {
                    throw new Error(`Erro ao gerar SKU: ${erroSku.message}`);
                }

                console.log(`✅ [Gemini] Imagem ${i + 1} analisada com sucesso`);
                console.log('📋 [DEBUG] Dados extraídos do Gemini:', JSON.stringify(dadosProduto, null, 2));

                produtosAnalysados.push(dadosProduto);
            } catch (erro) {
                console.error(`❌ Erro ao analisar imagem ${i + 1} (${arquivo.originalname}):`, erro.message);
                errosAnalise.push({
                    imagem: arquivo.originalname,
                    erro: erro.message,
                    etapa: 'analise_gemini'
                });
            }
        }

        console.log(`\n💾 [ProdutoRouter] Iniciando processamento de ${produtosAnalysados.length} produtos analisados`);

        // Processar upload de fotos e salvar produtos
        for (let i = 0; i < produtosAnalysados.length; i++) {
            const dadosProduto = produtosAnalysados[i];
            const arquivo = req.files[i];

            try {
                console.log(`\n📝 [Processing] Processando produto ${i + 1}/${produtosAnalysados.length}`);
                console.log('🔑 SKU:', dadosProduto.skuStyleMe);
                console.log('📦 Categoria:', dadosProduto.categoria);

                // ═══════════════════════════════════════════════════════
                // FAZER UPLOAD DA FOTO PARA CLOUDINARY
                // ═══════════════════════════════════════════════════════
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
                        // Continuar mesmo se falhar o upload - a foto é opcional
                    }
                }

                // Adicionar foto ao dados do produto
                dadosProduto.foto = foto;
                dadosProduto.fotoPublicId = fotoPublicId;

                console.log(`📸 Foto URL: ${foto || '(não enviada)'}`);

                // ═══════════════════════════════════════════════════════
                // SALVAR PRODUTO NO BANCO DE DADOS
                // ═══════════════════════════════════════════════════════

                // Criar novo documento Produto
                const novoProduto = new Produto(dadosProduto);

                // Salvar no banco de dados
                const produtoSalvo = await novoProduto.save();

                console.log(`✅ [Database] Produto salvo com sucesso! ID: ${produtoSalvo._id}`);
                produtosSalvos.push({
                    _id: produtoSalvo._id,
                    skuStyleMe: produtoSalvo.skuStyleMe,
                    categoria: produtoSalvo.categoria,
                    lojaId: produtoSalvo.lojaId,
                    foto: produtoSalvo.foto
                });
            } catch (erro) {
                console.error(`❌ Erro ao processar produto ${i + 1}:`, erro.message);

                // Verificar se é erro de duplicação de SKU
                if (erro.code === 11000) {
                    errosSalvamento.push({
                        sku: dadosProduto.skuStyleMe,
                        erro: 'SKU já existe no banco de dados',
                        etapa: 'salvamento_database',
                        tipo: 'duplicacao'
                    });
                } else {
                    errosSalvamento.push({
                        sku: dadosProduto.skuStyleMe || 'desconhecido',
                        erro: erro.message,
                        etapa: 'salvamento_database',
                        validacao: erro.errors ? Object.keys(erro.errors) : null
                    });
                }
            }
        }

        console.log(`\n📊 [Resumo] Análise: ${produtosAnalysados.length} imagens processadas`);
        console.log(`📊 [Resumo] Salvamento: ${produtosSalvos.length} produtos salvos com sucesso`);
        console.log(`📊 [Resumo] Erros de análise: ${errosAnalise.length}`);
        console.log(`📊 [Resumo] Erros de salvamento: ${errosSalvamento.length}`);

        // Responder com resultados detalhados
        return res.status(200).json({
            mensagem: `✅ Processamento concluído: ${produtosSalvos.length} produtos salvos, ${errosAnalise.length + errosSalvamento.length} erros`,
            resumo: {
                totalImagens: req.files.length,
                imagensAnalisadas: produtosAnalysados.length,
                produtosSalvos: produtosSalvos.length,
                errosAnalise: errosAnalise.length,
                errosSalvamento: errosSalvamento.length
            },
            produtosSalvos: produtosSalvos,
            produtosAnalysados: produtosAnalysados, // Retornar os dados analisados também para referência
            erros: {
                analise: errosAnalise.length > 0 ? errosAnalise : null,
                salvamento: errosSalvamento.length > 0 ? errosSalvamento : null
            },
            status: produtosSalvos.length === req.files.length ? 'sucesso_total' : 'sucesso_parcial'
        });
    } catch (erro) {
        console.error('❌ [ProdutoRouter] Erro ao processar lotes de imagens:', erro);
        return res.status(500).json({
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
