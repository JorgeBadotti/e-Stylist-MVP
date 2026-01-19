import Produto from '../models/Produto.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

// @desc    Buscar todos os produtos do catálogo de uma loja
// @route   GET /api/loja/:lojaId/catalog
// @access  Public
export const getCatalogo = async (req, res) => {
  try {
    // Por enquanto, vamos buscar todos os produtos.
    // Mais tarde, vamos filtrar por lojaId.
    const produtos = await Produto.find({});

    if (!produtos) {
      return res.status(404).json({ message: 'Nenhum produto encontrado no catálogo.' });
    }

    res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar catálogo:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar catálogo.' });
  }
};

// @desc    Buscar um produto específico por SKU
// @route   GET /api/loja/catalog/:sku
// @access  Public
export const getProdutoBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const produto = await Produto.findOne({ skuStyleMe: sku });

    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.status(200).json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto por SKU:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar produto.' });
  }
};

// @desc    Criar um novo produto manualmente (via formulário)
// @route   POST /api/loja/product
// @access  Private (precisará de autenticação do lojista)
export const createProdutoManualmente = async (req, res) => {
  try {
    const {
      lojaId, // Precisamos garantir que o produto seja associado à loja correta
      nome,
      descricao,
      preco,
      sku,
      estoque,
      cor,
      tamanho,
      colecao,
      estilo,
      tags
    } = req.body;

    // Validação básica
    if (!lojaId || !nome || !preco || !sku || !estoque) {
      return res.status(400).json({ message: 'Campos obrigatórios estão faltando: lojaId, nome, preco, sku, estoque.' });
    }

    // Verificar se o SKU já existe para evitar duplicatas
    const produtoExistente = await Produto.findOne({ skuStyleMe: sku });
    if (produtoExistente) {
      return res.status(409).json({ message: 'Um produto com este SKU já existe.' });
    }

    const novoProduto = new Produto({
      lojaId,
      nome,
      descricao,
      preco,
      skuStyleMe: sku,
      estoque,
      cor,
      tamanho,
      colecao,
      estilo,
      tags
    });

    const produtoSalvo = await novoProduto.save();

    res.status(201).json(produtoSalvo);
  } catch (error) {
    console.error('Erro ao criar produto manualmente:', error);
    res.status(500).json({ message: 'Erro no servidor ao criar produto.' });
  }
};

// @desc    Atualizar um produto existente
// @route   PUT /api/loja/product/:sku
// @access  Private
export const updateProduto = async (req, res) => {
  try {
    const { sku } = req.params;
    const updates = req.body;

    // Encontra o produto pelo SKU e o atualiza com os novos dados
    // { new: true } garante que o documento retornado seja a versão atualizada
    const produtoAtualizado = await Produto.findOneAndUpdate({ skuStyleMe: sku }, updates, { new: true });

    if (!produtoAtualizado) {
      return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
    }

    res.status(200).json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro no servidor ao atualizar produto.' });
  }
};

// @desc    Deletar um produto existente
// @route   DELETE /api/loja/product/:sku
// @access  Private
export const deleteProduto = async (req, res) => {
  try {
    const { sku } = req.params;

    const produtoDeletado = await Produto.findOneAndDelete({ skuStyleMe: sku });

    if (!produtoDeletado) {
      return res.status(404).json({ message: 'Produto não encontrado para exclusão.' });
    }

    res.status(200).json({ message: 'Produto deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro no servidor ao deletar produto.' });
  }
};

// @desc    Upload de produtos em massa via arquivo CSV
// @route   POST /api/loja/upload/csv
// @access  Private
export const uploadProdutosCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo CSV enviado.' });
    }

    const produtos = [];
    const buffer = req.file.buffer;
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => {
        // Aqui você pode mapear as colunas do CSV para os campos do seu modelo.
        // É importante que o CSV tenha cabeçalhos correspondentes (ex: nome, sku, preco).
        const produto = {
          lojaId: req.user.lojaId, // Associa o produto à loja do usuário logado
          nome: data.nome,
          descricao: data.descricao,
          preco: parseFloat(data.preco),
          sku: data.sku,
          estoque: parseInt(data.estoque, 10),
          cor: data.cor,
          tamanho: data.tamanho,
          colecao: data.colecao,
          estilo: data.estilo,
        };
        produtos.push(produto);
      })
      .on('end', async () => {
        try {
          if (produtos.length === 0) {
            return res.status(400).json({ message: 'O arquivo CSV está vazio ou em formato inválido.' });
          }
          // Insere todos os produtos no banco de dados de uma vez
          await Produto.insertMany(produtos, { ordered: false }); // ordered: false continua mesmo se um der erro
          res.status(201).json({ message: `${produtos.length} produtos importados com sucesso!` });
        } catch (error) {
          // Trata erros de inserção (ex: SKU duplicado)
          console.error('Erro ao inserir produtos do CSV:', error);
          res.status(500).json({
            message: 'Erro ao salvar produtos no banco de dados.',
            error: error.message
          });
        }
      });

  } catch (error) {
    console.error('Erro ao processar arquivo CSV:', error);
    res.status(500).json({ message: 'Erro no servidor ao processar arquivo CSV.' });
  }
};
