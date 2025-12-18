// services/lookEngine.ts
import type { EStylistInput, Look, LookItem, WardrobeItem, StoreItem } from '../types'; // Import LookItem, WardrobeItem, StoreItem

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Fix: Use imported StoreItem type
function scoreStoreItem(item: StoreItem, targetFormal: number, preferredCats: string[] = []) {
  const f = Number(item.nivel_formalidade ?? 3);
  const diff = Math.abs(f - targetFormal);
  let score = 100 - diff * 20;

  const cat = String(item.category ?? '').toLowerCase();
  if (preferredCats.includes(cat)) score += 10;

  return score;
}

export function topKStoreCatalog(storeCatalog: StoreItem[] | undefined, targetFormal: number, k = 25) {
  if (!storeCatalog || storeCatalog.length === 0) return [];
  const ranked = [...storeCatalog]
    .map((it) => ({ it, s: scoreStoreItem(it, targetFormal) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.it);
  return ranked.slice(0, k);
}

function pickByCategory(catalog: StoreItem[], category: string) {
  const cat = category.toLowerCase();
  return catalog.find((x) => String(x.category).toLowerCase() === cat) || null;
}

function pickAny(catalog: StoreItem[]) {
  return catalog[0] ?? null;
}

// Fix: Use StoreItem type for parameter and ensure return type is LookItem
function formatStoreItem(storeItem: StoreItem, priority: 'essencial' | 'opcional' = 'essencial'): LookItem {
  return {
    wardrobe_item_id: null,
    store_item_id: storeItem.store_item_id,
    name: storeItem.name,
    source: 'store' as const,
    is_external: true,
    can_purchase: true,
    product_url: storeItem.product_url ?? null,
    price: storeItem.price ?? null,
    installments: storeItem.installments ?? null,
    sales_support: {
      why_it_works: 'Completa o look com uma peça real disponível na loja, mantendo coerência com a ocasião.',
      versatility: 'Funciona também em outras combinações com peças neutras e básicas.',
      priority
    }
  };
}

// Fix: Use WardrobeItem type for parameter and ensure return type is LookItem
function formatUserItem(item: WardrobeItem): LookItem {
  return {
    wardrobe_item_id: item.id,
    store_item_id: null,
    name: item.name,
    source: 'user' as const,
    is_external: false,
    can_purchase: false,
    product_url: null,
    price: null,
    installments: null,
    sales_support: null
  };
}

// Fix: Use WardrobeItem[] for wardrobe parameter
function hasCategoryUser(wardrobe: WardrobeItem[], categories: string[]) {
  const set = new Set(wardrobe.map((w) => String(w.category).toLowerCase()));
  return categories.some((c) => set.has(c.toLowerCase()));
}

export function buildLooksDeterministic(input: EStylistInput) {
  const targetFormal = Number(input.occasion?.nivel_formalidade_esperado ?? 3);
  const wardrobe = input.wardrobe ?? [];
  const mode = input.mode ?? 'consumer';

  // Pré-filtra o store_catalog
  const storeTop = topKStoreCatalog(input.store_catalog, targetFormal, 25);
  const hasStore = storeTop.length > 0;

  // “mínimo” para look completo
  const needsBottom = !hasCategoryUser(wardrobe, ['calça', 'saia', 'short', 'bermuda']) &&
                      !hasCategoryUser(wardrobe, ['vestido', 'macacão']);
  const needsTop = !hasCategoryUser(wardrobe, ['blusa', 'camiseta', 'camisa', 'polo']) &&
                   !hasCategoryUser(wardrobe, ['vestido', 'macacão']);
  const needsShoes = !hasCategoryUser(wardrobe, ['calçado', 'sapato', 'tênis']);

  // Base: no modo seller, ignora wardrobe como “estoque” e usa loja
  const baseUserItems: LookItem[] = mode === 'seller' ? [] : wardrobe.slice(0, 2).map(formatUserItem);

  // Fix: Explicitly type the return of mkLook to ensure `items` can hold any `LookItem`
  const mkLook = (look_id: string, title: string): Omit<Look, 'highlight'> => ({
    look_id,
    title,
    formalidade_calculada: clamp(targetFormal, 1, 5),
    items: [...baseUserItems], // This array can now correctly infer to LookItem[]
    why_it_works: '',
    warnings: [] as string[]
  });

  // Fix: Explicitly type the 'looks' array to correctly infer the 'items' type
  const looks: Omit<Look, 'highlight'>[] = [
    mkLook('look_01', 'Mais Versátil'),
    mkLook('look_02', 'Equilibrado e Elegante'),
    mkLook('look_03', 'Mais Confortável')
  ];

  // Se não tem nada (wardrobe vazio e loja vazia)
  if (wardrobe.length === 0 && !hasStore) {
    for (const l of looks) {
      l.items = []; // Ensure items is an empty array of LookItem type
      l.warnings.push(
        'Você ainda não tem peças cadastradas e não há itens de loja cadastrados. Cadastre pelo menos 1 parte de cima e 1 parte de baixo (ou um vestido), e 1 calçado.'
      );
      l.why_it_works = 'Assim que você cadastrar essas peças, eu consigo montar looks completos.';
    }
    return {
      looks: looks as Look[], // Cast to Look[] to match EStylistOutput
      voice_text:
        'Para eu montar looks completos, preciso que você cadastre pelo menos uma parte de cima e uma parte de baixo, ou um vestido, e um calçado. Quando isso estiver pronto, eu gero três sugestões na hora.',
      next_question: 'Você quer cadastrar agora as primeiras peças essenciais?'
    };
  }

  // Completar com loja quando necessário (somente se store existe)
  for (const l of looks) {
    if (!hasStore) {
      // Sem loja: NUNCA criar itens externos — só orientar em texto
      const needs: string[] = [];
      // This part here should also consider the items that are ALREADY in the look (from wardrobe)
      // to avoid suggesting items already covered.
      const existingCategories = new Set(l.items.map(i => {
          // If it's a wardrobe item, get its category
          if (i.source === 'user' && i.wardrobe_item_id) {
              const originalItem = wardrobe.find(w => w.id === i.wardrobe_item_id);
              return originalItem?.category?.toLowerCase();
          }
          // If it's a store item or generic, its name might hint at category, or rely on existing categories
          return i.name.toLowerCase(); // simplified for now, might need better logic
      }));

      // Adjust needs based on existing items in `l.items`
      if (needsTop && !existingCategories.has('blusa') && !existingCategories.has('camiseta') && !existingCategories.has('camisa') && !existingCategories.has('polo') && !existingCategories.has('vestido') && !existingCategories.has('macacão')) needs.push('uma parte de cima (camiseta/blusa/camisa)');
      if (needsBottom && !existingCategories.has('calça') && !existingCategories.has('saia') && !existingCategories.has('short') && !existingCategories.has('bermuda') && !existingCategories.has('vestido') && !existingCategories.has('macacão')) needs.push('uma parte de baixo (calça/saia) ou uma peça única (vestido/macacão)');
      if (needsShoes && !existingCategories.has('calçado') && !existingCategories.has('sapato') && !existingCategories.has('tênis')) needs.push('um calçado');

      if (needs.length) {
        l.warnings.push(`Para completar este look, considere cadastrar: ${needs.join(', ')}.`);
      }
      l.why_it_works = 'Usei apenas as peças que já existem no seu guarda-roupa. Assim que você cadastrar mais itens, consigo criar combinações mais completas.';
      continue;
    }

    // Com loja: completar para ter pelo menos 3 itens (ajustável)
    while (l.items.length < 3) {
      // Tenta pegar categorias úteis
      const currentLookCategories = new Set(l.items.map(item => String(item.name).toLowerCase())); // Simple way to track categories in current look

      let storePick = null;
      if (needsBottom && !currentLookCategories.has('calça') && !currentLookCategories.has('saia')) {
        storePick = pickByCategory(storeTop, 'calça');
      }
      if (!storePick && needsShoes && !currentLookCategories.has('calçado') && !currentLookCategories.has('sapato') && !currentLookCategories.has('tênis')) {
        storePick = pickByCategory(storeTop, 'calçado');
      }
      if (!storePick) {
        // Fallback: pick any item from storeTop not already in the look
        storePick = storeTop.find(item => !l.items.some(existingItem => existingItem.store_item_id === item.store_item_id));
      }

      if (!storePick) break; // If no item found, exit loop

      l.items.push(formatStoreItem(storePick, 'essencial'));
      // remove para evitar repetição excessiva
      const idx = storeTop.findIndex((x) => x.store_item_id === storePick.store_item_id);
      if (idx >= 0) storeTop.splice(idx, 1);
    }

    l.why_it_works =
      'Este look foi montado com peças reais. As peças marcadas como “Loja” podem ser adquiridas para completar a combinação com facilidade.';
  }

  const voice_text =
    hasStore
      ? 'Preparei 3 sugestões. Algumas peças vêm de lojas parceiras e podem ser adquiridas pelo botão Comprar. Quer compartilhar algum look com a cliente ou explorar outro estilo?'
      : 'Preparei 3 sugestões usando apenas o que existe no seu guarda-roupa. Se você cadastrar mais peças, consigo deixar os looks mais completos e variados.';

  const next_question =
    hasStore
      ? ''
      : 'Você quer que eu sugira uma lista curta de peças essenciais para cadastrar primeiro?';

  return { looks: looks as Look[], voice_text, next_question }; // Cast to Look[] to match EStylistOutput
}