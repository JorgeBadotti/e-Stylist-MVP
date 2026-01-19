// --- Input Types ---

export interface Profile {
  name: string;
  style_preferences: string[];
  body_shape: string;
  // ✅ NOVO: Medidas corporais do usuário para validação de fit
  body_measurements?: {
    chest_cm?: number;
    waist_cm?: number;
    hips_cm?: number;
    height_cm?: number;
  };
  photo_base64?: string; // NOVO: Campo para armazenar a foto base64 do usuário
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  fabric: string; // ✅ NOVO: Adiciona o campo fabric
  style: string;
  fit: string;
  nivel_formalidade: number;
  // ✅ NOVO: Campos de marca para itens do guarda-roupa
  brand_id?: string;
  brand_name?: string;
}

export interface Occasion {
  id: string; // Added occasion ID
  name: string;
  nivel_formalidade_esperado: number;
}

// ✅ NOVO: Interface para especificar os intervalos de tamanho de uma peça
export interface SizeSpecs {
  size_label: string; // Ex: 'P', 'M', 'G', '40', '42'
  chest_min_cm?: number;
  chest_max_cm?: number;
  waist_min_cm?: number;
  waist_max_cm?: number;
  hips_min_cm?: number;
  hips_max_cm?: number;
}

export interface StoreItem {
  store_item_id: string;
  store_name: string;
  product_url: string; // link real (ou deep link)
  name: string;
  category: string;
  fabric: string; // ✅ NOVO: Adiciona o campo fabric
  nivel_formalidade: number; // 1..5
  price?: number; // ✅ Novo: preço do item
  installments?: string; // ✅ Novo: condições de parcelamento
  commission_tag?: string; // ✅ Novo: tag de comissão (apenas para uso interno/backend)
  // ✅ NOVO: Campos de marca para itens da loja (obrigatórios para loja)
  brand_id: string;
  brand_name: string;
  // ✅ NOVO: Especificações de tamanho para a peça (tabela de equivalência)
  size_specs?: SizeSpecs[];
  // ✅ NOVO: Campo para especificar a modelagem geral do item, se houver
  fit_model?: 'Regular' | 'Slim' | 'Loose' | 'Classic' | string;
}

export type EStylistMode = 'consumer' | 'seller'; // ✅ NOVO: Tipo de modo do stylist

export interface EStylistInput {
  profile: Profile;
  wardrobe: WardrobeItem[];
  occasion: Occasion;
  store_catalog?: StoreItem[]; // ✅ novo
  mode?: EStylistMode; // ✅ NOVO: Modo de operação (consumer ou seller)
  smart_copy?: boolean; // ✅ novo: IA opcional
}

// --- Output Types ---

export type ItemSource = 'user' | 'store';
export type SalesPriority = 'essencial' | 'opcional';

export interface LookItem {
  wardrobe_item_id: string | null;
  store_item_id?: string | null;
  name: string;
  is_external: boolean; // true quando source='store' ou source=null (para genérico)
  source: ItemSource | null; // ✅ Tornou-se obrigatório, pode ser 'user', 'store' ou null (para genérico externo)
  can_purchase?: boolean;
  product_url?: string | null;
  price?: number; // ✅ Novo: preço do item (para itens de loja)
  installments?: string; // ✅ Novo: condições de parcelamento (para itens de loja)
  // ✅ NOVO: Campos de marca para itens de look
  brand_id?: string;
  brand_name?: string;
  // ✅ NOVO: Campo para especificar a modelagem geral do item, se houver (útil para items de loja)
  fit_model?: 'Regular' | 'Slim' | 'Loose' | 'Classic' | string;
  fabric?: string; // ✅ NOVO: Adiciona o campo fabric para LookItem
  // ✅ NOVO: Sugestão de tamanho da peça para o usuário, com base nas medidas
  size_recommendation?: string;

  sales_support?: {
    why_it_works: string;
    versatility: string;
    priority: SalesPriority;
  };
}

export type LookHighlight = 'versatil' | 'custo-beneficio' | 'formalidade-ideal';

export interface Look {
  look_id: string;
  title: string;
  formalidade_calculada: number;
  items: LookItem[]; // Alterado para LookItem[]
  why_it_works: string;
  warnings: string[];
  highlight?: LookHighlight; // ✅ Novo: indica um destaque para o look
}

export interface EStylistOutput {
  looks: Look[];
  voice_text: string;
  next_question: string;
}

// NOVO: Tipo para o escopo de compartilhamento
export type ShareScope = 'public' | 'private';

// NOVO: Interface para a saída simulada da API de Visão Computacional
export interface DetectedMeasurements {
  chest_cm: number;
  waist_cm: number;
  hips_cm: number;
  height_cm: number;
  confidence: number; // 0.0 to 1.0
}

// NOVO: Interface para o objeto armazenado no link de compartilhamento
export interface SharedLinkData {
  look: Look;
  profile: Profile;
}

// --- Tipos da Loja ---

// ✅ NOVO: Tipos para cadastro de usuário/loja
export interface RegisterUserData {
  nome: string;
  email: string;
  password: string;
}

export interface RegisterStoreData extends RegisterUserData {
  telefone: string;
  cnpj: string;
}

export interface Produto {
  _id: string;
  lojaId: string;
  nome: string;
  descricao: string;
  preco: number;
  sku: string;
  skuStyleMe?: string; // SKU STYLEME: CAM-M-BRA-37-001-P25
  cor_codigo?: string; // Código da cor: BRA, PRT, etc
  foto?: string; // URL da foto no Cloudinary
  cor?: string;
  tamanho?: string;
  colecao?: string;
  estilo?: string;
  tags?: string[];
  estoque: number;
  codigoSCS?: string;
  codigoEStylist?: string;
  disponivel: boolean;
  createdAt: string;
  updatedAt: string;
}