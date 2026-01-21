import React, { useState, useEffect } from 'react';
import { getProdutoBySku } from '../../src/services/lojaService';
import { Produto } from '../../src/types/types';
import CadastroProdutoSKUManual from '../CadastroProdutoSKUManual';

interface ProdutoDetalheProps {
  sku: string;
  onBack: () => void;
  lojaId?: string;
}

// Mapa de labels profissionais (sem emojis)
const labelMaps = {
  layer_role: {
    BASE: 'Peça Base',
    MID: 'Camada Média',
    OUT: 'Camada Externa',
  },
  color_role: {
    NEUTRO: 'Neutro',
    DESTAQUE: 'Destaque',
  },
  fit: {
    JUSTO: 'Justo',
    REGULAR: 'Regular',
    SOLTO: 'Solto',
    OVERSIZE: 'Oversize',
  },
  style_base: {
    CASUAL: 'Casual',
    FORMAL: 'Formal',
    SPORT: 'Sport',
    CHIC: 'Chic',
  },
  silhueta: {
    A: 'Trapézio (A)',
    H: 'Reta (H)',
    V: 'Invertida (V)',
    O: 'Arredondada (O)',
  },
  comprimento: {
    CURTA: 'Curta',
    REGULAR: 'Regular',
    LONGA: 'Longa',
  },
  posicao_cintura: {
    NATURAL: 'Natural',
    ALTO: 'Alto',
    BAIXO: 'Baixo',
  },
  ocasiao: {
    CASUAL: 'Casual',
    WORK: 'Trabalho',
    NIGHT: 'Noite',
    GYM: 'Academia',
    FORMAL: 'Formal',
  },
  estacao: {
    SPRING: 'Primavera',
    SUMMER: 'Verão',
    FALL: 'Outono',
    WINTER: 'Inverno',
    ALL: 'O Ano Todo',
  },
  temperatura: {
    COLD: 'Frio',
    MILD: 'Ameno',
    HOT: 'Quente',
    ALL: 'Todas',
  },
  material_principal: {
    ALGODAO: 'Algodão',
    POLIESTER: 'Poliéster',
    VISCOSE: 'Viscose',
    ELASTANO: 'Elastano',
    LINHO: 'Linho',
    LÃ: 'Lã',
    SEDA: 'Seda',
    DENIM: 'Denim',
  },
  eco_score: {
    EXCELLENT: 'Excelente',
    GOOD: 'Bom',
    MEDIUM: 'Médio',
    LOW: 'Baixo',
  },
  care_level: {
    EASY: 'Fácil',
    MEDIUM: 'Médio',
    COMPLEX: 'Complexo',
  },
  faixa_preco: {
    BUDGET: 'Budget',
    STANDARD: 'Standard',
    PREMIUM: 'Premium',
    LUXURY: 'Luxury',
  },
  classe_margem: {
    LOW: 'Baixa',
    NORMAL: 'Normal',
    HIGH: 'Alta',
  },
  linha: {
    F: 'Feminina',
    M: 'Masculina',
    U: 'Unissex',
  },
};

const ProdutoDetalhe: React.FC<ProdutoDetalheProps> = ({ sku, onBack, lojaId }) => {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagemPrincipal, setImagemPrincipal] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setLoading(true);
        const data = await getProdutoBySku(sku);
        setProduto(data);
        setImagemPrincipal(data.foto || null);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os detalhes do produto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [sku]);

  const getLabel = (field: keyof typeof labelMaps, value: any) => {
    return (labelMaps[field] as any)?.[value] || value;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando detalhes...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );

  if (!produto)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Produto não encontrado.</p>
      </div>
    );

  // Se está em modo de edição, retorna o formulário de cadastro
  if (editMode && lojaId) {
    return (
      <CadastroProdutoSKUManual
        lojaId={lojaId}
        produtoEditar={produto}
        skuOriginal={sku}
        onProdutoCriado={() => {
          setEditMode(false);
          onBack();
        }}
        onCancelar={() => setEditMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Catálogo
          </button>
          {lojaId && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Produto
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna Esquerda: Imagem */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6 aspect-square flex items-center justify-center overflow-hidden">
              {imagemPrincipal ? (
                <img
                  src={imagemPrincipal}
                  alt={produto.nome}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <svg className="w-24 h-24 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm">Sem imagem</p>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {produto.fotos && produto.fotos.length > 1 && (
              <div className="flex gap-2">
                {produto.fotos.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagemPrincipal(foto)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${imagemPrincipal === foto ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img src={foto} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna Direita: Informações */}
          <div className="space-y-8">
            {/* Cabeçalho */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{produto.nome}</h1>
                  <p className="text-sm text-gray-500 mt-2 font-mono">{produto.skuStyleMe || sku}</p>
                </div>
                {produto.peca_hero && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full whitespace-nowrap">
                    DESTAQUE
                  </span>
                )}
              </div>
            </div>

            {/* Categoria e Linha */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Categoria</p>
                <p className="text-lg font-semibold text-gray-900">{produto.categoria}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Linha</p>
                <p className="text-lg font-semibold text-gray-900">{getLabel('linha', produto.linha)}</p>
              </div>
            </div>

            {/* Descrição */}
            {produto.descricao && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Descrição</h3>
                <p className="text-gray-700 leading-relaxed">{produto.descricao}</p>
              </div>
            )}

            {/* Preço e Estoque */}
            {(produto.preco || produto.estoque !== undefined) && (
              <div className="grid grid-cols-2 gap-4">
                {produto.preco && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Preço</p>
                    <p className="text-2xl font-bold text-green-700">R$ {(produto.preco || 0).toFixed(2)}</p>
                  </div>
                )}
                {produto.estoque !== undefined && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Estoque</p>
                    <p className="text-2xl font-bold text-blue-700">{produto.estoque} un.</p>
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>

        {/* Características em Grid */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Especificações Técnicas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* NÚCLEO */}
            {produto.layer_role && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Papel na Composição</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('layer_role', produto.layer_role)}</p>
              </div>
            )}

            {produto.color_role && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Função da Cor</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('color_role', produto.color_role)}</p>
              </div>
            )}

            {produto.fit && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Ajuste ao Corpo</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('fit', produto.fit)}</p>
              </div>
            )}

            {produto.style_base && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Estilo Base</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('style_base', produto.style_base)}</p>
              </div>
            )}

            {produto.silhueta && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Silhueta</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('silhueta', produto.silhueta)}</p>
              </div>
            )}

            {produto.comprimento && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Comprimento</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('comprimento', produto.comprimento)}</p>
              </div>
            )}

            {produto.posicao_cintura && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Posição Cintura</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('posicao_cintura', produto.posicao_cintura)}</p>
              </div>
            )}

            {produto.ocasiao && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Ocasião</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('ocasiao', produto.ocasiao)}</p>
              </div>
            )}

            {produto.estacao && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Estação</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('estacao', produto.estacao)}</p>
              </div>
            )}

            {produto.temperatura && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Temperatura</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('temperatura', produto.temperatura)}</p>
              </div>
            )}

            {produto.material_principal && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Material</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('material_principal', produto.material_principal)}</p>
              </div>
            )}

            {produto.eco_score && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Eco Score</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('eco_score', produto.eco_score)}</p>
              </div>
            )}

            {produto.care_level && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Cuidado</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('care_level', produto.care_level)}</p>
              </div>
            )}

            {produto.faixa_preco && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Faixa de Preço</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('faixa_preco', produto.faixa_preco)}</p>
              </div>
            )}

            {produto.classe_margem && (
              <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Classe Margem</p>
                <p className="text-base font-semibold text-gray-900">{getLabel('classe_margem', produto.classe_margem)}</p>
              </div>
            )}

            {/* SKU Componentes */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Cor Código</p>
              <p className="text-base font-semibold text-gray-900">{produto.cor_codigo}</p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Tamanho</p>
              <p className="text-base font-semibold text-gray-900">{produto.tamanho}</p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Coleção</p>
              <p className="text-base font-semibold text-gray-900">{produto.colecao}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhe;
