import mongoose from 'mongoose';

const produtoLojaSchema = new mongoose.Schema({
  lojaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loja',
    required: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true
  },
  // --- PREÇO DE VENDA (definido pela loja) ---
  preco: {
    type: Number,
    required: true
  },
  // -------------------------
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fotos: [{
    type: String
  }],
  cor: {
    type: String
  },
  tamanho: {
    type: String
  },
  colecao: {
    type: String
  },
  estilo: {
    type: String
  },
  tags: [{
    type: String
  }],
  estoque: {
    type: Number,
    required: true,
    default: 0
  },
  codigoSCS: {
    type: String
  },
  codigoEStylist: {
    type: String
  },
  disponivel: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ProdutoLoja = mongoose.model('ProdutoLoja', produtoLojaSchema);

export default ProdutoLoja;
