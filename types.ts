// --- Input Types ---

export interface Profile {
  name: string;
  style_preferences: string[];
  body_shape: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  fabric: string;
  style: string;
  fit: string;
  nivel_formalidade: number;
}

export interface Occasion {
  id: string; // Added occasion ID
  name: string;
  nivel_formalidade_esperado: number;
}

export interface StoreItem {
  store_item_id: string;
  store_name: string;
  product_url: string; // link real (ou deep link)
  name: string;
  category: string;
  nivel_formalidade: number; // 1..5
  price?: number; // ✅ Novo: preço do item
  installments?: string; // ✅ Novo: condições de parcelamento
  commission_tag?: string; // ✅ Novo: tag de comissão (apenas para uso interno/backend)
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
