import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProdutoBySku } from '../../../src/services/lojaService';
import { Produto } from '../../../src/types/types';
import CadastroProdutoSKUManual from '../product/CadastroProdutoSKUManual';
import QRCodeModal from '../../common/Modals/QRCodeModal';
import api from '../../../src/services/api';
import { UserContext } from '../../../index';

interface ProdutoDetalheProps {
  sku: string;
  onBack: () => void;
  lojaId?: string;
  onGerarLookComPeca?: (sku: string) => void; // ✅ NOVO: Callback para gerar look com peça
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

// Função helper para obter labels baseado no tipo e valor
const getLabel = (type: string, value: string): string => {
  const typeMap = labelMaps[type as keyof typeof labelMaps];
  if (!typeMap) return value;
  return typeMap[value as any] || value;
};

const ProdutoDetalhe: React.FC<ProdutoDetalheProps> = ({ sku, onBack, lojaId, onGerarLookComPeca }) => {
  const navigate = useNavigate(); // ✅ NOVO: Para navegar com itemObrigatorio
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagemPrincipal, setImagemPrincipal] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [carrinhoLoading, setCarrinhoLoading] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [carrinhoError, setCarrinhoError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletando, setDeletando] = useState(false);

  // Get user context for lojaId and role
  const userContext = useContext(UserContext);
  const effectiveLojaId = lojaId || userContext?.user?.lojaId;
  const contextUserRole = userContext?.user?.role;

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

    // Obter role do usuário do localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        const role = userData.role || null;
        console.log('DEBUG: User role encontrado:', role, 'Full userData:', userData);
        setUserRole(role);
      } catch (e) {
        console.error('Erro ao parsear userData', e);
      }
    } else {
      console.log('DEBUG: Nenhum userData encontrado no localStorage');
    }

    fetchProduto();
  }, [sku]);

  // Função para adicionar ao carrinho
  const handleAdicionarAoCarrinho = async () => {
    if (!produto) return;

    try {
      setCarrinhoLoading(true);
      setCarrinhoError(null);
      setSucessoMsg(null);

      // Enviar para backend: ele cria carrinho se não existir + adiciona item
      const response = await api.post('/api/carrinhos/adicionar-item', {
        produtoId: produto._id,
        skuStyleMe: produto.skuStyleMe,
        quantidade: 1
      });

      setSucessoMsg(`✅ ${produto.skuStyleMe} adicionado ao carrinho!`);

      // Limpar mensagem após 3 segundos
      setTimeout(() => setSucessoMsg(null), 3000);

    } catch (err: any) {
      console.error('Erro ao adicionar ao carrinho:', err);
      const errorMsg = err.response?.data?.message || 'Erro ao adicionar ao carrinho';
      setCarrinhoError(errorMsg);
    } finally {
      setCarrinhoLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FUNÇÃO PARA DELETAR PRODUTO
  // ═══════════════════════════════════════════════════════════
  const handleDeletarProduto = async () => {
    if (!produto?._id) return;

    try {
      setDeletando(true);
      await api.delete(`/api/produtos/${produto._id}`);

      setShowDeleteModal(false);
      setSucessoMsg(`✅ Produto ${produto.skuStyleMe} deletado com sucesso!`);

      // Voltar para catálogo após 2 segundos
      setTimeout(() => {
        navigate('/loja-catalogo');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao deletar produto:', err);
      setCarrinhoError(err.response?.data?.message || 'Erro ao deletar produto');
    } finally {
      setDeletando(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDERIZAÇÃO CONDICIONAL
  // ═══════════════════════════════════════════════════════════

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
  if (editMode && effectiveLojaId) {
    return (
      <CadastroProdutoSKUManual
        lojaId={effectiveLojaId}
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
          {effectiveLojaId && (contextUserRole === 'STORE_ADMIN' || contextUserRole === 'SALESPERSON') && (
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
          {/* Botão Deletar - Visível apenas para STORE_ADMIN */}
          {effectiveLojaId && (contextUserRole === 'STORE_ADMIN') && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Deletar
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
            <div className="flex gap-4 pt-4 flex-col md:flex-row">
              {/* Mensagens de feedback */}
              {sucessoMsg && (
                <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {sucessoMsg}
                </div>
              )}
              {carrinhoError && (
                <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {carrinhoError}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-4 pt-4 flex-col md:flex-row">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              {/* ✅ Botão Gerar Look com Peça - IA (Apenas usuários normais, não admin) */}
              {(!userRole || (userRole !== 'STORE_ADMIN' && userRole !== 'SUPER_ADMIN')) && (
                <button
                  onClick={() => {
                    console.log(`[LookSession] Iniciando com itemObrigatorio: ${sku}`);
                    if (onGerarLookComPeca) {
                      onGerarLookComPeca(produto?.skuStyleMe || sku);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Gerar Look com Peça
                </button>
              )}
              {/* ✅ Botão Adicionar ao Carrinho - Para todos exceto STORE_ADMIN e SUPER_ADMIN */}
              {(!userRole || (userRole !== 'STORE_ADMIN' && userRole !== 'SUPER_ADMIN')) && (
                <button
                  onClick={handleAdicionarAoCarrinho}
                  disabled={carrinhoLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {carrinhoLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adicionar ao Carrinho
                    </>
                  )}
                </button>
              )}
              {/* Botão QR Code - Visível apenas para STORE_ADMIN e SALESPERSON */}
              {userRole && (userRole === 'STORE_ADMIN' || userRole === 'SALESPERSON' || userRole === 'salesperson' || userRole === 'store_admin') && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  QR Code
                </button>
              )}
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

      {/* QR Code Modal */}
      {produto && (
        <QRCodeModal
          isOpen={showQRModal}
          produtoUrl={`${window.location.origin}/gerar-looks?itemObrigatorio=${sku}&lojaid=${produto.lojaId}`}
          produtoNome={produto.nome}
          produtoSku={produto.skuStyleMe || sku}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL DE CONFIRMAÇÃO DE DELETE
      ═══════════════════════════════════════════════════════════ */}
      {showDeleteModal && produto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Deletar Produto?
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Você realmente quer deletar este produto?
              </p>
            </div>

            {/* Informações do produto */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Nome</p>
                <p className="text-base font-semibold text-gray-900">{produto.nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">SKU</p>
                <p className="text-base font-mono text-gray-800">{produto.skuStyleMe}</p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletando}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletarProduto}
                disabled={deletando}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deletando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutoDetalhe;
