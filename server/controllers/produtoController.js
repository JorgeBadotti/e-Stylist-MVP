import Produto from '../models/Produto.js';
import GuardaRoupa from '../models/GuardaRoupa.js';
import Loja from '../models/Loja.js';
import Dicionario from '../models/DicionarioStyleMe.js';
import { uploadImage, deleteImage } from '../services/cloudinary.js';
import {
    gerarSKUStyleMe,
    validarSKUStyleMe,
    extrairComponentesSKU,
    verificarDuplicataSKU
} from '../utils/skuStyleMeUtils.js';

/**
 * CREATE PRODUTO COM SKU STYLEME v1
 * 
 * Recebe:
 * - Componentes do SKU (categoria, linha, cor_codigo, tamanho, colecao)
 * - Núcleo de Combinação (layer_role, color_role, fit, style_base)
 * - Opcionais (campos recomendados e opcionais)
 * 
 * Gera:
 * - SKU STYLEME automático
 * - Sequencial único
 * - Validação contra dicionários
 */
export const createProduto = async (req, res) => {
    try {
        const {
            // Componentes do SKU STYLEME
            categoria,
            linha,
            cor_codigo,
            tamanho,
            colecao,
            sequencia, // Opcional - será gerado automaticamente

            // Núcleo de Combinação (OBRIGATÓRIOS)
            layer_role,
            color_role,
            fit,
            style_base,

            // Recomendados
            silhueta,
            comprimento,
            posicao_cintura,
            ocasiao,
            estacao,
            temperatura,

            // Opcionais
            material_principal,
            eco_score,
            care_level,
            faixa_preco,
            peca_hero,
            classe_margem,

            // Dados técnicos
            nome,
            descricao,
            guardaRoupaId,
            lojaId
        } = req.body;

        const usuarioId = req.user._id;

        // ═══════════════════════════════════════════════════════
        // 1. VALIDAÇÕES PRÉ-REQUISITOS
        // ═══════════════════════════════════════════════════════

        // Validar que produto está associado a algo
        if (!guardaRoupaId && !lojaId) {
            return res.status(400).json({
                message: 'Produto deve estar associado a um GuardaRoupa ou Loja'
            });
        }

        // Validar campos obrigatórios de SKU
        const camposObrigatoriosSKU = ['categoria', 'linha', 'cor_codigo', 'tamanho', 'colecao'];
        const camposAusentesSkU = camposObrigatoriosSKU.filter(campo => !req.body[campo]);
        if (camposAusentesSkU.length > 0) {
            return res.status(400).json({
                message: `Campos obrigatórios do SKU STYLEME ausentes: ${camposAusentesSkU.join(', ')}`,
                exemplo: {
                    categoria: 'CAM',
                    linha: 'F',
                    cor_codigo: 'PRT',
                    tamanho: 'M',
                    colecao: 'F24'
                }
            });
        }

        // Validar campos obrigatórios de combinação
        const camposObrigatoriosCombinacao = ['layer_role', 'color_role', 'fit', 'style_base'];
        const camposAusentesCombinacao = camposObrigatoriosCombinacao.filter(campo => !req.body[campo]);
        if (camposAusentesCombinacao.length > 0) {
            return res.status(400).json({
                message: `Campos obrigatórios de combinação ausentes: ${camposAusentesCombinacao.join(', ')}`,
                enums: {
                    layer_role: ['BASE', 'MID', 'OUT'],
                    color_role: ['NEUTRO', 'DESTAQUE'],
                    fit: ['JUSTO', 'REGULAR', 'SOLTO', 'OVERSIZE'],
                    style_base: ['CASUAL', 'FORMAL', 'SPORT', 'CHIC']
                }
            });
        }

        // Validar permissões de acesso
        if (guardaRoupaId) {
            const donoGuardaRoupa = await GuardaRoupa.findOne({
                _id: guardaRoupaId,
                usuario: usuarioId
            });
            if (!donoGuardaRoupa) {
                return res.status(403).json({
                    message: 'GuardaRoupa inválido ou acesso negado'
                });
            }
        }

        if (lojaId) {
            const donaLoja = await Loja.findOne({
                _id: lojaId,
                usuario: usuarioId
            });
            if (!donaLoja) {
                return res.status(403).json({
                    message: 'Loja inválida ou acesso negado'
                });
            }
        }

        // ═══════════════════════════════════════════════════════
        // 2. VALIDAR CONTRA DICIONÁRIOS
        // ═══════════════════════════════════════════════════════

        const validacoesDicionario = await Promise.all([
            Dicionario.findOne({
                tipo: 'CATEGORIA',
                codigo: categoria,
                status: 'ATIVO'
            }),
            Dicionario.findOne({
                tipo: 'LINHA',
                codigo: linha,
                status: 'ATIVO'
            }),
            Dicionario.findOne({
                tipo: 'COR',
                codigo: cor_codigo,
                status: 'ATIVO'
            }),
            Dicionario.findOne({
                tipo: 'TAMANHO',
                codigo: tamanho,
                status: 'ATIVO'
            })
        ]);

        const [dicCategoria, dicLinha, dicCor, dicTamanho] = validacoesDicionario;

        const errosDicionario = [];
        if (!dicCategoria) errosDicionario.push(`Categoria inválida: ${categoria}`);
        if (!dicLinha) errosDicionario.push(`Linha inválida: ${linha}`);
        if (!dicCor) errosDicionario.push(`Cor inválida: ${cor_codigo}`);
        if (!dicTamanho) errosDicionario.push(`Tamanho inválido: ${tamanho}`);

        if (errosDicionario.length > 0) {
            return res.status(400).json({
                message: 'Valores não encontrados nos dicionários',
                erros: errosDicionario,
                dica: 'Use GET /api/dicionarios?tipo=CATEGORIA para ver valores válidos'
            });
        }

        // ═══════════════════════════════════════════════════════
        // 3. GERAR SKU STYLEME
        // ═══════════════════════════════════════════════════════

        let skuGerado;
        try {
            skuGerado = await gerarSKUStyleMe({
                categoria,
                linha,
                cor_codigo,
                tamanho,
                colecao,
                sequencia // Será gerado se não fornecido
            }, Produto);

            // Verificar duplicata
            const temDuplicata = await verificarDuplicataSKU(skuGerado.skuStyleMe, Produto);
            if (temDuplicata) {
                return res.status(400).json({
                    message: 'SKU STYLEME já existe no sistema',
                    skuDuplicado: skuGerado.skuStyleMe
                });
            }
        } catch (error) {
            return res.status(400).json({
                message: 'Erro ao gerar SKU STYLEME',
                detalhes: error.message
            });
        }

        // ═══════════════════════════════════════════════════════
        // 4. PROCESSAR IMAGEM
        // ═══════════════════════════════════════════════════════

        let foto = '';
        let fotoPublicId = '';

        if (req.file) {
            try {
                const upload = await uploadImage(req.file.buffer, 'produtos');
                foto = upload.secure_url;
                fotoPublicId = upload.public_id;
            } catch (error) {
                console.error('Erro ao fazer upload de imagem:', error);
                return res.status(400).json({
                    message: 'Erro ao processar imagem',
                    detalhes: error.message
                });
            }
        }

        // ═══════════════════════════════════════════════════════
        // 5. EXTRAIR COMPONENTES DO SKU GERADO
        // ═══════════════════════════════════════════════════════

        const sequenciaFinal = skuGerado.sequencia;
        const skuStyleMe = skuGerado.skuStyleMe;

        // ═══════════════════════════════════════════════════════
        // 6. CRIAR DOCUMENTO
        // ═══════════════════════════════════════════════════════

        const novoProduto = new Produto({
            // SKU STYLEME
            skuStyleMe,
            categoria,
            linha,
            cor_codigo,
            tamanho,
            sequencia: sequenciaFinal,
            colecao,

            // Núcleo de Combinação
            layer_role,
            color_role,
            fit,
            style_base,

            // Recomendados
            silhueta: silhueta || null,
            comprimento: comprimento || null,
            posicao_cintura: posicao_cintura || null,
            ocasiao: ocasiao || null,
            estacao: estacao || null,
            temperatura: temperatura || null,

            // Opcionais
            material_principal: material_principal || null,
            eco_score: eco_score || null,
            care_level: care_level || null,
            faixa_preco: faixa_preco || null,
            peca_hero: peca_hero || false,
            classe_margem: classe_margem || null,

            // Dados técnicos
            nome: nome || 'Produto sem nome',
            descricao: descricao || '',
            foto,
            fotoPublicId,

            // Relacionamentos
            guardaRoupaId: guardaRoupaId || null,
            lojaId: lojaId || null,

            status: 'ATIVO'
        });

        await novoProduto.save();

        res.status(201).json({
            message: 'Produto criado com sucesso',
            skuStyleMe: novoProduto.skuStyleMe,
            sequencia: sequenciaFinal,
            produto: novoProduto
        });

    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({
            message: 'Erro ao criar produto',
            error: error.message
        });
    }
};

/**
 * GET PRODUTOS BY GUARDA ROUPA
 */
export const getProdutosByGuardaRoupa = async (req, res) => {
    try {
        const { guardaRoupaId } = req.params;

        const guardaRoupa = await GuardaRoupa.findById(guardaRoupaId);

        if (!guardaRoupa) {
            return res.status(404).json({
                message: 'GuardaRoupa não encontrado'
            });
        }

        // Verifica permissão: é o dono OU é público
        const isOwner = guardaRoupa.usuario.toString() === req.user._id.toString();
        const isPublic = guardaRoupa.isPublic || false;

        if (!isOwner && !isPublic) {
            return res.status(403).json({
                message: 'Acesso negado: este guarda-roupa é privado'
            });
        }

        // Busca produtos
        const produtos = await Produto.find({ guardaRoupaId })
            .sort({ createdAt: -1 });

        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao listar produtos',
            error: error.message
        });
    }
};

/**
 * GET PRODUTOS BY LOJA
 */
export const getProdutosByLoja = async (req, res) => {
    try {
        const { lojaId } = req.params;

        const loja = await Loja.findById(lojaId);

        if (!loja) {
            return res.status(404).json({
                message: 'Loja não encontrada'
            });
        }

        // Busca produtos
        const produtos = await Produto.find({ lojaId })
            .sort({ createdAt: -1 });

        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao listar produtos',
            error: error.message
        });
    }
};

/**
 * UPDATE PRODUTO
 */
export const updateProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user._id;

        // Buscar produto por SKU STYLEME (o 'id' é na verdade o SKU)
        const produtoAtual = await Produto.findOne({ skuStyleMe: id }).select('+fotoPublicId');

        if (!produtoAtual) {
            return res.status(404).json({
                message: 'Produto não encontrado'
            });
        }

        // Validar permissão
        if (produtoAtual.guardaRoupaId) {
            const guardaRoupa = await GuardaRoupa.findOne({
                _id: produtoAtual.guardaRoupaId,
                usuario: usuarioId
            });
            if (!guardaRoupa) {
                return res.status(403).json({
                    message: 'Acesso negado'
                });
            }
        }

        if (produtoAtual.lojaId) {
            const loja = await Loja.findOne({
                _id: produtoAtual.lojaId,
                usuario: usuarioId
            });
            if (!loja) {
                return res.status(403).json({
                    message: 'Acesso negado'
                });
            }
        }

        // Campos que podem ser atualizados
        const camposAtualizaveis = [
            // Componentes do SKU STYLEME (EDITÁVEIS)
            'categoria',
            'linha',
            'cor_codigo',
            'tamanho',
            'colecao',

            // Núcleo de Combinação (IMPORTANTE: estes são os campos principais!)
            'layer_role',
            'color_role',
            'fit',
            'style_base',

            // Recomendados
            'silhueta',
            'comprimento',
            'posicao_cintura',
            'ocasiao',
            'estacao',
            'temperatura',

            // Opcionais
            'material_principal',
            'eco_score',
            'care_level',
            'faixa_preco',
            'peca_hero',
            'classe_margem',

            // Técnicos
            'nome',
            'descricao',
            'status'
        ];

        const updateData = {};
        camposAtualizaveis.forEach(campo => {
            if (req.body[campo] !== undefined) {
                updateData[campo] = req.body[campo];
            }
        });

        // Se houver nova imagem
        if (req.file) {
            try {
                if (produtoAtual.fotoPublicId) {
                    await deleteImage(produtoAtual.fotoPublicId);
                }

                const result = await uploadImage(req.file.buffer, 'produtos');
                updateData.foto = result.secure_url;
                updateData.fotoPublicId = result.public_id;
            } catch (error) {
                console.error("Erro ao atualizar imagem:", error);
                return res.status(500).json({
                    message: 'Erro ao processar nova imagem'
                });
            }
        }

        // Atualizar
        const produtoAtualizado = await Produto.findByIdAndUpdate(produtoAtual._id, updateData, {
            new: true
        });

        res.status(200).json({
            message: 'Produto atualizado com sucesso',
            produto: produtoAtualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erro ao atualizar produto',
            error: error.message
        });
    }
};

/**
 * DELETE PRODUTO
 */
export const deleteProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user._id;

        // Buscar produto
        const produto = await Produto.findById(id).select('+fotoPublicId');

        if (!produto) {
            return res.status(404).json({
                message: 'Produto não encontrado'
            });
        }

        // Validar permissão
        if (produto.guardaRoupaId) {
            const guardaRoupa = await GuardaRoupa.findOne({
                _id: produto.guardaRoupaId,
                usuario: usuarioId
            });
            if (!guardaRoupa) {
                return res.status(403).json({
                    message: 'Acesso negado'
                });
            }
        }

        if (produto.lojaId) {
            const loja = await Loja.findOne({
                _id: produto.lojaId,
                usuario: usuarioId
            });
            if (!loja) {
                return res.status(403).json({
                    message: 'Acesso negado'
                });
            }
        }

        // Deletar imagem
        if (produto.fotoPublicId) {
            await deleteImage(produto.fotoPublicId);
        }

        // Deletar do banco
        await Produto.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Produto removido com sucesso',
            skuDeletado: produto.skuStyleMe
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao deletar produto',
            error: error.message
        });
    }
};

/**
 * GET DICIONÁRIOS
 * GET /api/dicionarios?tipo=CATEGORIA
 */
export const getDicionarios = async (req, res) => {
    try {
        const { tipo, status = 'ATIVO' } = req.query;

        if (!tipo) {
            return res.status(400).json({
                message: 'Parâmetro "tipo" é obrigatório',
                tiposValidos: [
                    'CATEGORIA',
                    'LINHA',
                    'COR',
                    'TAMANHO',
                    'LAYER_ROLE',
                    'COLOR_ROLE',
                    'FIT',
                    'STYLE_BASE',
                    'SILHUETA',
                    'COMPRIMENTO',
                    'POSICAO_CINTURA',
                    'OCASIAO',
                    'ESTACAO',
                    'TEMPERATURA',
                    'MATERIAL',
                    'ECO_SCORE',
                    'CARE_LEVEL',
                    'FAIXA_PRECO'
                ]
            });
        }

        const dicionarios = await Dicionario.find({
            tipo,
            status
        }).sort({ codigo: 1 });

        res.status(200).json({
            tipo,
            total: dicionarios.length,
            dados: dicionarios
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar dicionários',
            error: error.message
        });
    }
};

/**
 * GET SUGESTÃO DE PRÓXIMO SKU
 * GET /api/produtos/sku-sugestao
 */
export const sugerirSKU = async (req, res) => {
    try {
        const { categoria, colecao } = req.query;

        if (!categoria || !colecao) {
            return res.status(400).json({
                message: 'Parâmetros "categoria" e "colecao" são obrigatórios',
                exemplo: '?categoria=CAM&colecao=F24'
            });
        }

        // Contar próximo sequencial
        const count = await Produto.countDocuments({
            categoria,
            colecao,
            status: { $ne: 'DESCONTINUADO' }
        });

        const proximoSeq = String(count + 1).padStart(3, '0');

        res.status(200).json({
            categoria,
            colecao,
            proximoSequencial: proximoSeq,
            exemploCodigo: `${categoria}-[LINHA]-[COR]-[TAM]-${proximoSeq}-${colecao}`
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao sugerir SKU',
            error: error.message
        });
    }
};

/**
 * GET PRODUTOS DISPONÍVEIS PARA UM GUARDA-ROUPA
 * Retorna produtos que NÃO estão associados a este guarda-roupa
 */
export const getProdutosDisponiveisParaGuardaRoupa = async (req, res) => {
    try {
        const { guardaRoupaId } = req.params;

        // Verificar se guarda-roupa existe e se usuário tem permissão
        const guardaRoupa = await GuardaRoupa.findById(guardaRoupaId);
        if (!guardaRoupa) {
            return res.status(404).json({ message: 'GuardaRoupa não encontrado' });
        }

        const isOwner = guardaRoupa.usuario.toString() === req.user._id.toString();
        if (!isOwner) {
            return res.status(403).json({ message: 'Acesso negado: você não é o dono deste guarda-roupa' });
        }

        // Buscar todos os produtos que NÃO estão neste guarda-roupa
        const produtosDisponiveis = await Produto.find({
            guardaRoupaId: { $ne: guardaRoupaId }
        }).sort({ skuStyleMe: 1 });

        res.status(200).json(produtosDisponiveis);
    } catch (error) {
        console.error('❌ [getProdutosDisponiveisParaGuardaRoupa] Erro:', error);
        res.status(500).json({
            message: 'Erro ao buscar produtos disponíveis',
            error: error.message
        });
    }
};

/**
 * GET PRODUTO POR SKU (PÚBLICO)
 * GET /api/produtos/:sku
 * Retorna detalhes de um produto pelo SKU STYLEME
 * Rota pública - sem autenticação
 */
export const getProdutoPorSKU = async (req, res) => {
    try {
        const { sku } = req.params;

        // Buscar produto por SKU STYLEME
        const produto = await Produto.findOne({ skuStyleMe: sku });

        if (!produto) {
            return res.status(404).json({
                message: `Produto com SKU ${sku} não encontrado`
            });
        }

        res.status(200).json(produto);
    } catch (error) {
        console.error(`❌ [getProdutoPorSKU] Erro ao buscar produto ${req.params.sku}:`, error);
        res.status(500).json({
            message: 'Erro ao buscar produto',
            error: error.message
        });
    }
};

export default {
    createProduto,
    getProdutosByGuardaRoupa,
    getProdutosByLoja,
    getProdutoPorSKU,
    updateProduto,
    deleteProduto,
    getDicionarios,
    sugerirSKU,
    getProdutosDisponiveisParaGuardaRoupa
};
