// services/lookEngine.ts
import type { EStylistInput, Look, LookItem, WardrobeItem, StoreItem, Profile, SizeSpecs } from '../types'; // Import LookItem, WardrobeItem, StoreItem, Profile, SizeSpecs

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

/**
 * ✅ NOVO: Função para validar o fit e recomendar um tamanho com Smart Fit Logic
 * Compara as medidas do usuário com as especificações de tamanho da peça e aplica regras de negócio.
 * Considera o tipo de tecido para ajustar a recomendação (subir tamanho, manter com alerta, ou seguir estrito).
 * @param profile O perfil do usuário, incluindo body_measurements.
 * @param storeItem O item da loja com size_specs e fabric.
 * @returns Uma string com a recomendação de tamanho ou null se não for possível determinar.
 */
function checkFitAndRecommendSize(profile: Profile, storeItem: StoreItem): string | null {
  const userMeasurements = profile.body_measurements;
  const sizeSpecs = storeItem.size_specs;

  if (!userMeasurements || !sizeSpecs || sizeSpecs.length === 0) {
    return null; // Não há dados suficientes para fazer a recomendação
  }

  let bestFitSize: SizeSpecs | null = null;
  let bestFitIndex = -1;

  for (let i = 0; i < sizeSpecs.length; i++) {
    const spec = sizeSpecs[i];
    let fits = true;

    // Verifica medidas do peito
    if (userMeasurements.chest_cm !== undefined && spec.chest_min_cm !== undefined && spec.chest_max_cm !== undefined) {
      if (userMeasurements.chest_cm < spec.chest_min_cm || userMeasurements.chest_cm > spec.chest_max_cm) {
        fits = false;
      }
    }
    // Verifica medidas da cintura
    if (userMeasurements.waist_cm !== undefined && spec.waist_min_cm !== undefined && spec.waist_max_cm !== undefined) {
      if (userMeasurements.waist_cm < spec.waist_min_cm || userMeasurements.waist_cm > spec.waist_max_cm) {
        fits = false;
      }
    }
    // Verifica medidas do quadril
    if (userMeasurements.hips_cm !== undefined && spec.hips_min_cm !== undefined && spec.hips_max_cm !== undefined) {
      if (userMeasurements.hips_cm < spec.hips_min_cm || userMeasurements.hips_cm > spec.hips_max_cm) {
        fits = false;
      }
    }

    if (fits) {
      bestFitSize = spec;
      bestFitIndex = i;
      break; // Encontrou um fit, pode parar
    }
  }

  if (bestFitSize) {
    let recommendedSizeLabel = bestFitSize.size_label;
    let recommendationMessage = `Sugerimos Tam. ${recommendedSizeLabel} para esta marca.`;
    const fabric = storeItem.fabric?.toLowerCase() || '';

    // Regra de Sugestão 1: "Marca X" e modelagem "Slim" (Regra existente, priorizada)
    const isBrandExecutivaChic = storeItem.brand_name === 'Executiva Chic';
    const isSlimFit = storeItem.fit_model === 'Slim';

    let shouldUpsizeForBrandX = false;
    if (isBrandExecutivaChic && isSlimFit && bestFitIndex !== -1) {
      // Verifica se as medidas do usuário estão no limite superior do tamanho
      if (userMeasurements.chest_cm !== undefined && bestFitSize.chest_max_cm !== undefined && userMeasurements.chest_cm === bestFitSize.chest_max_cm) {
        shouldUpsizeForBrandX = true;
      }
      if (userMeasurements.waist_cm !== undefined && bestFitSize.waist_max_cm !== undefined && userMeasurements.waist_cm === bestFitSize.waist_max_cm) {
        shouldUpsizeForBrandX = true;
      }
      if (userMeasurements.hips_cm !== undefined && bestFitSize.hips_max_cm !== undefined && userMeasurements.hips_cm === bestFitSize.hips_max_cm) {
        shouldUpsizeForBrandX = true;
      }

      // Se deve subir o tamanho e existe um tamanho maior
      if (shouldUpsizeForBrandX && bestFitIndex + 1 < sizeSpecs.length) {
        recommendedSizeLabel = sizeSpecs[bestFitIndex + 1].size_label;
        return `Sugerimos Tam. ${recommendedSizeLabel} para um caimento mais confortável (esta marca tem modelagem ajustada).`;
      }
    }

    // Regra de Sugestão 2: Smart Fit Logic baseada em tecido (aplicada se a regra acima não se aplicou)
    let smartFitApplied = false;

    // Cenário A: Tecidos Rígidos (Ex: 100% Algodão, Couro, Linho)
    if (fabric.includes("100% algodão") || fabric.includes("linho") || fabric.includes("couro")) {
      let rigidUpsizeNeeded = false;
      // Para cada medida, verifica se está nos últimos 20% do intervalo do tamanho
      if (userMeasurements.waist_cm !== undefined && bestFitSize.waist_min_cm !== undefined && bestFitSize.waist_max_cm !== undefined) {
        const range = bestFitSize.waist_max_cm - bestFitSize.waist_min_cm;
        const threshold = bestFitSize.waist_max_cm - range * 0.2; // Últimos 20%
        if (userMeasurements.waist_cm >= threshold) rigidUpsizeNeeded = true;
      }
      if (userMeasurements.chest_cm !== undefined && bestFitSize.chest_min_cm !== undefined && bestFitSize.chest_max_cm !== undefined) {
        const range = bestFitSize.chest_max_cm - bestFitSize.chest_min_cm;
        const threshold = bestFitSize.chest_max_cm - range * 0.2;
        if (userMeasurements.chest_cm >= threshold) rigidUpsizeNeeded = true;
      }
      if (userMeasurements.hips_cm !== undefined && bestFitSize.hips_min_cm !== undefined && bestFitSize.hips_max_cm !== undefined) {
        const range = bestFitSize.hips_max_cm - bestFitSize.hips_min_cm;
        const threshold = bestFitSize.hips_max_cm - range * 0.2;
        if (userMeasurements.hips_cm >= threshold) rigidUpsizeNeeded = true;
      }

      if (rigidUpsizeNeeded && bestFitIndex + 1 < sizeSpecs.length) {
        recommendedSizeLabel = sizeSpecs[bestFitIndex + 1].size_label;
        recommendationMessage = `Sugerimos Tam. ${recommendedSizeLabel} (tamanho acima devido à rigidez do tecido para melhor conforto).`;
        smartFitApplied = true;
      }
    }
    // Cenário B: Tecidos Flexíveis (Ex: Elastano > 3%, Malha, Viscolycra)
    else if (
        (fabric.includes("elastano") && (parseFloat(fabric.match(/(\d+)% elastano/)?.[1] || '0') > 3)) ||
        fabric.includes("malha") ||
        fabric.includes("viscolycra")
    ) {
      let exceedsLimitSlightly = false; // Ultrapassa limite em até 2%
      if (userMeasurements.waist_cm !== undefined && bestFitSize.waist_max_cm !== undefined) {
        if (userMeasurements.waist_cm > bestFitSize.waist_max_cm && userMeasurements.waist_cm <= bestFitSize.waist_max_cm * 1.02) {
          exceedsLimitSlightly = true;
        }
      }
      if (userMeasurements.chest_cm !== undefined && bestFitSize.chest_max_cm !== undefined) {
        if (userMeasurements.chest_cm > bestFitSize.chest_max_cm && userMeasurements.chest_cm <= bestFitSize.chest_max_cm * 1.02) {
          exceedsLimitSlightly = true;
        }
      }
      if (userMeasurements.hips_cm !== undefined && bestFitSize.hips_max_cm !== undefined) {
        if (userMeasurements.hips_cm > bestFitSize.hips_max_cm && userMeasurements.hips_cm <= bestFitSize.hips_max_cm * 1.02) {
          exceedsLimitSlightly = true;
        }
      }

      if (exceedsLimitSlightly) {
        recommendationMessage = `Sugerimos Tam. ${recommendedSizeLabel} (para um fit justo/modelador, devido à elasticidade do tecido).`;
        smartFitApplied = true;
      }
      // Se não exceder levemente, mas for flexível e cair no tamanho, apenas dá a recomendação padrão
      else if (!smartFitApplied) {
        recommendationMessage = `Sugerimos Tam. ${recommendedSizeLabel} (tecido flexível, priorizando caimento fluido).`;
        smartFitApplied = true;
      }
    }
    // Cenário C: Tecidos de Alfaiataria (Ex: Lã Fria, Crepe com pouco elastano)
    else if (fabric.includes("lã fria") || fabric.includes("crepe")) {
        // Se encaixou, mantém a recomendação padrão.
        // Já está coberto pelo `recommendationMessage` inicial.
        smartFitApplied = true;
    }

    return recommendationMessage; // Retorna a mensagem ajustada ou a padrão
  }

  // Fallback se nenhuma especificação de tamanho couber
  return `Consulte a tabela de medidas da ${storeItem.brand_name}.`;
}

// Fix: Use StoreItem type for parameter and ensure return type is LookItem
function formatStoreItem(storeItem: StoreItem, profile: Profile, priority: 'essencial' | 'opcional' = 'essencial'): LookItem {
  // ✅ NOVO: Adiciona brand_id, brand_name, fit_model, fabric e size_recommendation
  const sizeRecommendation = checkFitAndRecommendSize(profile, storeItem);

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
    brand_id: storeItem.brand_id,
    brand_name: storeItem.brand_name,
    fit_model: storeItem.fit_model, // ✅ NOVO
    fabric: storeItem.fabric, // ✅ NOVO
    size_recommendation: sizeRecommendation,
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
    brand_id: item.brand_id,
    brand_name: item.brand_name,
    fit_model: null, // ✅ NOVO: Não se aplica diretamente para itens do guarda-roupa sem fit_model de loja
    fabric: item.fabric, // ✅ NOVO
    size_recommendation: null, // ✅ NOVO: Não se aplica para itens do guarda-roupa
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
  const profile = input.profile; // ✅ NOVO: Acessa o perfil do usuário

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

      l.items.push(formatStoreItem(storePick, profile, 'essencial')); // ✅ NOVO: Passa o perfil para formatStoreItem
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