// services/eStylistService.ts

import { EStylistInput, EStylistOutput, LookItem, ItemSource, SalesPriority, StoreItem, LookHighlight, EStylistMode, Look, ShareScope, Profile, SharedLinkData } from '../types';
import api from './api';

// ✅ NOVOS: Importa o motor determinístico e os templates de cópia
import { buildLooksDeterministic } from './lookEngine';
import { applyTemplates } from './copyTemplates';

/**
 * Validação mínima para não quebrar o app E garantir a blindagem lógica dos testes A e B.
 */
function validateOutputShape(output: any, input: EStylistInput): output is EStylistOutput {
  if (!output || typeof output !== 'object') {
    console.error('Validation Error: Output is not an object.', output);
    return false;
  }
  if (!Array.isArray(output.looks) || output.looks.length !== 3) {
    console.error('Validation Error: Looks array is missing or does not contain 3 looks.', output.looks);
    return false;
  }
  if (typeof output.voice_text !== 'string') {
    console.error('Validation Error: voice_text is missing or not a string.', output.voice_text);
    return false;
  }
  if (typeof output.next_question !== 'string') {
    console.error('Validation Error: next_question is missing or not a string.', output.next_question);
    return false;
  }

  let highlightCount = 0;
  const hasStoreInInput = (input.store_catalog && input.store_catalog.length > 0);
  const initialWardrobeItemCount = input.wardrobe.length;
  const isSellerMode = input.mode === 'seller';

  for (const look of output.looks) {
    if (!look || typeof look !== 'object') {
      console.error('Validation Error: Look object is invalid.', look);
      return false;
    }
    if (typeof look.look_id !== 'string') {
      console.error('Validation Error: Look ID is missing or not a string.', look.look_id);
      return false;
    }
    if (typeof look.title !== 'string') {
      console.error('Validation Error: Look title is missing or not a string.', look.title);
      return false;
    }
    if (typeof look.formalidade_calculada !== 'number' || look.formalidade_calculada < 1 || look.formalidade_calculada > 5) {
      console.error('Validation Error: Formalidade calculada is invalid.', look.formalidade_calculada);
      return false;
    }
    if (!Array.isArray(look.items) || look.items.length < 1) { // Deve ter pelo menos 1 item
      console.error('Validation Error: Look items array is invalid or empty.', look.items);
      return false;
    }
    if (typeof look.why_it_works !== 'string') {
      console.error('Validation Error: why_it_works is missing or not a string.', look.why_it_works);
      return false;
    }
    if (!Array.isArray(look.warnings)) {
      console.error('Validation Error: Warnings is not an array.', look.warnings);
      return false;
    }

    if (look.highlight && !['versatil', 'custo-beneficio', 'formalidade-ideal'].includes(look.highlight)) {
      console.error('Validation Error: Invalid highlight value.', look.highlight);
      return false;
    }
    if (look.highlight) highlightCount++;


    for (const item of look.items) {
      if (!item || typeof item !== 'object') {
        console.error('Validation Error: Item object is invalid.', item);
        return false;
      }
      if (typeof item.name !== 'string') {
        console.error('Validation Error: Item name is missing or not a string.', item.name);
        return false;
      }
      if (typeof item.is_external !== 'boolean') {
        console.error('Validation Error: is_external is missing or not a boolean.', item.is_external);
        return false;
      }

      // source é obrigatório
      if (!(item.source === 'user' || item.source === 'store' || item.source === null)) {
        console.error('Validation Error: Invalid item source.', item.source);
        return false;
      }

      // Proibido: is_external: true com source: 'user'
      if (item.is_external === true && item.source === 'user') {
        console.error("Validation Error: Forbidden combination -> is_external: true with source: 'user'.", item);
        return false;
      }

      // ✅ NOVO: Proibido: wardrobe_item_id preenchido no "seller" mode
      if (isSellerMode && item.wardrobe_item_id !== null && item.wardrobe_item_id !== undefined) {
        console.error("Validation Error (Seller Mode): wardrobe_item_id must be null for all items.", item);
        return false;
      }


      // is_external: false (item do guarda-roupa)
      if (!item.is_external) {
        if (typeof item.wardrobe_item_id !== 'string' || item.wardrobe_item_id === null) {
          console.error('Validation Error: wardrobe_item_id is invalid for internal item.', item);
          return false;
        }
        if (item.source !== 'user') {
          console.error('Validation Error: Source must be "user" for internal item.', item);
          return false;
        }
        // ✅ NOVO: No modo "seller", não pode ter item interno do guarda-roupa
        if (isSellerMode) {
            console.error("Validation Error (Seller Mode): Look item cannot be from 'user' source.", item);
            return false;
        }
        if (item.store_item_id !== null && item.store_item_id !== undefined) {
          console.error('Validation Error: store_item_id must be null for internal item.', item);
          return false;
        }
        if (item.can_purchase !== false && item.can_purchase !== undefined) {
          console.error('Validation Error: can_purchase must be false for internal item.', item);
          return false;
        }
        if (item.product_url !== null && item.product_url !== undefined) {
          console.error('Validation Error: product_url must be null for internal item.', item);
          return false;
        }
        if (item.price !== null && item.price !== undefined) {
          console.error('Validation Error: price must be null for internal item.', item);
          return false;
        }
        if (item.installments !== null && item.installments !== undefined) {
          console.error('Validation Error: installments must be null for internal item.', item);
          return false;
        }
        if (item.sales_support !== null && item.sales_support !== undefined) {
          console.error('Validation Error: sales_support must be null for internal item.', item);
          return false;
        }
        // ✅ NOVO: brand_id e brand_name obrigatórios para itens do guarda-roupa
        if (typeof item.brand_id !== 'string' || item.brand_id === null) {
          console.error('Validation Error: brand_id is missing or invalid for user item.', item);
          return false;
        }
        if (typeof item.brand_name !== 'string' || item.brand_name === null) {
          console.error('Validation Error: brand_name is missing or invalid for user item.', item);
          return false;
        }
        if (item.fabric !== null && item.fabric !== undefined && typeof item.fabric !== 'string') {
          console.error('Validation Error: fabric must be a string or null for user item.', item);
          return false;
        }
        if (item.size_recommendation !== null && item.size_recommendation !== undefined) {
          console.error('Validation Error: size_recommendation must be null for user item.', item);
          return false;
        }
        if (item.fit_model !== null && item.fit_model !== undefined) {
          console.error('Validation Error: fit_model must be null for user item.', item);
          return false;
        }
      }
      // is_external: true (item externo)
      else {
        if (item.wardrobe_item_id !== null && item.wardrobe_item_id !== undefined) {
          console.error('Validation Error: wardrobe_item_id must be null for external item.', item);
          return false;
        }

        // is_external: true, source: 'store' (item de loja)
        if (item.source === 'store') {
          if (typeof item.store_item_id !== 'string' || item.store_item_id === null) {
            console.error('Validation Error: store_item_id is invalid for store item.', item);
            return false;
          }
          if (item.can_purchase !== true) {
            console.error('Validation Error: can_purchase must be true for store item.', item);
            return false;
          }
          if (typeof item.product_url !== 'string' || item.product_url === null) {
            console.error('Validation Error: product_url is invalid for store item.', item);
            return false;
          }
          // ✅ NOVO: sales_support é obrigatório para item de loja
          if (!item.sales_support || typeof item.sales_support !== 'object') {
            console.error('Validation Error: sales_support is missing or invalid for store item.', item);
            return false;
          }
          if (typeof item.sales_support.why_it_works !== 'string') {
            console.error('Validation Error: sales_support.why_it_works is missing or invalid for store item.', item);
            return false;
          }
          if (typeof item.sales_support.versatility !== 'string') {
            console.error('Validation Error: sales_support.versatility is missing or invalid for store item.', item);
            return false;
          }
          if (!['essencial', 'opcional'].includes(item.sales_support.priority)) {
            console.error('Validation Error: sales_support.priority is missing or invalid for store item.', item);
            return false;
          }
          // price e installments são opcionais, mas devem ser do tipo correto se presentes
          if (item.price !== undefined && item.price !== null && typeof item.price !== 'number') {
            console.error('Validation Error: price is invalid for store item.', item);
            return false;
          }
          if (item.installments !== undefined && item.installments !== null && typeof item.installments !== 'string') {
            console.error('Validation Error: installments is invalid for store item.', item);
            return false;
          }
          // ✅ NOVO: brand_id, brand_name e size_recommendation obrigatórios para itens de loja
          if (typeof item.brand_id !== 'string' || item.brand_id === null) {
            console.error('Validation Error: brand_id is missing or invalid for store item.', item);
            return false;
          }
          if (typeof item.brand_name !== 'string' || item.brand_name === null) {
            console.error('Validation Error: brand_name is missing or invalid for store item.', item);
            return false;
          }
          if (typeof item.fabric !== 'string' || item.fabric === null) {
            console.error('Validation Error: fabric is missing or invalid for store item.', item);
            return false;
          }
          if (typeof item.size_recommendation !== 'string' || item.size_recommendation === null) {
            console.error('Validation Error: size_recommendation is missing or invalid for store item.', item);
            return false;
          }
          if (item.fit_model !== undefined && item.fit_model !== null && typeof item.fit_model !== 'string') {
            console.error('Validation Error: fit_model is invalid for store item.', item);
            return false;
          }

          // Teste A: Se input.store_catalog estiver vazio, NÃO pode haver item com source: 'store'
          if (!hasStoreInInput) {
            console.error("Validation Error: Found 'source: store' item when input.store_catalog is empty.", item);
            return false;
          }
        }
        // is_external: true, source: null (item genérico externo)
        else if (item.source === null) {
          if (item.store_item_id !== null && item.store_item_id !== undefined) {
            console.error('Validation Error: store_item_id must be null for generic external item.', item);
            return false;
          }
          if (item.can_purchase !== false && item.can_purchase !== undefined) {
            console.error('Validation Error: can_purchase must be false for generic external item.', item);
            return false;
          }
          if (item.product_url !== null && item.product_url !== undefined) {
            console.error('Validation Error: product_url must be null for generic external item.', item);
            return false;
          }
          if (item.price !== null && item.price !== undefined) {
            console.error('Validation Error: price must be null for generic external item.', item);
            return false;
          }
          if (item.installments !== null && item.installments !== undefined) {
            console.error('Validation Error: installments must be null for generic external item.', item);
            return false;
          }
          if (item.sales_support !== null && item.sales_support !== undefined) {
            console.error('Validation Error: sales_support must be null for generic external item.', item);
            return false;
          }
          // ✅ NOVO: brand_id, brand_name, fabric e size_recommendation DEVEM ser NULOS para itens genéricos externos
          if (item.brand_id !== null && item.brand_id !== undefined) {
            console.error('Validation Error: brand_id must be null for generic external item.', item);
            return false;
          }
          if (item.brand_name !== null && item.brand_name !== undefined) {
            console.error('Validation Error: brand_name must be null for generic external item.', item);
            return false;
          }
          if (item.fabric !== null && item.fabric !== undefined) {
            console.error('Validation Error: fabric must be null for generic external item.', item);
            return false;
          }
          if (item.size_recommendation !== null && item.size_recommendation !== undefined) {
            console.error('Validation Error: size_recommendation must be null for generic external item.', item);
            return false;
          }
          if (item.fit_model !== null && item.fit_model !== undefined) {
            console.error('Validation Error: fit_model must be null for generic external item.', item);
            return false;
          }
        } else {
          console.error("Validation Error: Unexpected source type for external item.", item);
          return false;
        }
      }
    }

    // --- Blindagem Lógica: Teste A e B para Consumer, e validações para Seller ---

    if (isSellerMode) {
        // No modo seller, deve ter pelo menos 3 itens por look (priorizando store_catalog)
        // ou avisar se não for possível.
        if (look.items.length < 3) {
            // Se tem menos de 3, deve ter um warning sobre falta de estoque/sugestão externa
            const hasStockWarning = look.warnings.some(w => w.includes('estoque limitado') || w.includes('sugestão externa para completar'));
            if (!hasStockWarning) {
                console.error("Validation Error (Seller Mode): Look has less than 3 items and no stock warning.", look);
                return false;
            }
        }
        // Pelo menos 1 item deve ser da loja se há catálogo.
        if (hasStoreInInput) {
            const hasStoreItem = look.items.some(item => item.source === 'store' && item.can_purchase);
            if (!hasStoreItem && look.items.length > 0) { // Se o look não está vazio, mas não tem item da loja, é um erro.
                console.error("Validation Error (Seller Mode): No store item found in look despite store catalog being available.", look);
                return false;
            }
        } else { // Se não há store_catalog no input no modo seller, todos os itens devem ser genéricos e deve haver um warning
            const allItemsAreGeneric = look.items.every(item => item.source === null && item.is_external === true);
            const hasNoCatalogWarning = look.warnings.some(w => w.includes('catálogo de produtos vazio'));
            if (!allItemsAreGeneric || !hasNoCatalogWarning) {
                console.error("Validation Error (Seller Mode): No store catalog, but items are not all generic or missing warning.", look);
                return false;
            }
        }
    } else { // Consumer Mode
        // Teste A: Sem loja, 1 peça (estrito)
        // Se não há catálogo de loja E há apenas 1 item no guarda-roupa, cada look DEVE ter 1 item.
        if (!hasStoreInInput && initialWardrobeItemCount === 1) {
            if (look.items.length !== 1) {
                console.error(`Validation Error (Teste A): Look should contain exactly 1 item when no store and 1 wardrobe item. Found ${look.items.length} items.`, look);
                return false;
            }
            // E nenhum item deve ser comprável (já coberto abaixo, mas reforça)
            const hasPurchasableItem = look.items.some((item: any) => item.can_purchase === true);
            if (hasPurchasableItem) {
                console.error("Validation Error (Teste A): Found purchasable item when input.store_catalog is empty and initial wardrobe count is 1.", look);
                return false;
            }
        }
        // Teste B: Com loja, 1 peça (ou mais)
        // Se há catálogo de loja, cada look DEVE ter pelo menos 3 itens,
        // E PELO MENOS UM deles deve ser comprável (source: 'store', can_purchase: true, product_url)
        else if (hasStoreInInput) {
            if (look.items.length < 3) {
                console.error(`Validation Error (Teste B): Look should contain at least 3 items when store catalog is available. Found ${look.items.length} items.`, look);
                return false;
            }
            const hasPurchasableStoreItem = look.items.some((item: any) =>
                item.source === 'store' && item.can_purchase === true && typeof item.product_url === 'string' && item.product_url !== null
            );
            if (!hasPurchasableStoreItem) {
                console.error("Validation Error (Teste B): No purchasable store item found in look when store catalog is available.", look);
                return false;
            }
        } else { // Cenário padrão sem loja (consumer), but with more than 1 item in wardrobe or intent to complete
            // If no store and few items in wardrobe, but not strict Test A,
            // we expect `enrichWithStoreOrTextFallback` to have added generic suggestions, so `items.length` might be > 1.
            // We just ensure no purchasable items.
            const hasPurchasableItem = look.items.some((item: any) => item.can_purchase === true);
            if (hasPurchasableItem) {
                console.error("Validation Error (Consumer - General): Found purchasable item when input.store_catalog is empty (outside Test A strict scenario).", look);
                return false;
            }
        }
    }
  }

  // Apenas um highlight deve ser definido no total (entre os 3 looks)
  if (highlightCount > 1) {
    console.error("Validation Error: More than one look has 'highlight' defined. Only one is allowed.", output.looks);
    return false;
  }

  return true;
}

// User-provided utility functions (not used directly here, but in lookEngine)
/*
function pickStoreItem(storeCatalog: StoreItem[] | undefined, category?: string): StoreItem | null {
  if (!storeCatalog || storeCatalog.length === 0) return null;
  if (!category) return storeCatalog[0];
  const found = storeCatalog.find((x) => String(x.category).toLowerCase() === String(category).toLowerCase());
  return found || storeCatalog[0];
}
*/


function enrichWithStoreOrTextFallback(output: EStylistOutput, input: EStylistInput): EStylistOutput {
  const storeCatalog = input.store_catalog || [];
  const hasStore = storeCatalog.length > 0;
  // const initialWardrobeItemCount = input.wardrobe.length; // Not directly used here anymore
  const isSellerMode = input.mode === 'seller';

  let usedStore = false; // Flag to track if store items were used
  let highlightAssigned = false;

  const looks = output.looks.map((look) => {
    // Ensure highlight is null if it's not a valid type
    if (look.highlight && !['versatil', 'custo-beneficio', 'formalidade-ideal'].includes(look.highlight)) {
      look.highlight = null; // Set to null instead of undefined
    } else if (look.highlight) {
      highlightAssigned = true;
    }

    // Check if any store items were used
    if (look.items.some(item => item.source === 'store')) {
      usedStore = true;
    }

    // Ensure sales_support is correctly set for store items (fallback if AI misses it)
    for (const item of look.items) {
      if (item.source === 'store' && !item.sales_support) {
        item.sales_support = {
          why_it_works: `Sugestão de produto do estoque: A ${item.name} é uma excelente opção para este look.`,
          versatility: 'Peça versátil que pode ser combinada de diversas formas.',
          priority: 'essencial' as SalesPriority,
        };
      }
      // ✅ NEW: Ensure brand_id, brand_name, fit_model and fabric for store items
      if (item.source === 'store' && item.store_item_id) {
        const originalStoreItem = storeCatalog.find(si => si.store_item_id === item.store_item_id);
        if (originalStoreItem) {
          if (!item.brand_id) item.brand_id = originalStoreItem.brand_id;
          if (!item.brand_name) item.brand_name = originalStoreItem.brand_name;
          if (!item.fit_model) item.fit_model = originalStoreItem.fit_model; // ✅ NEW: Copy fit_model
          if (!item.fabric) item.fabric = originalStoreItem.fabric; // ✅ NEW: Copy fabric
        }
      }
      // ✅ NEW: Ensure size_recommendation for store items if missing
      if (item.source === 'store' && item.store_item_id && !item.size_recommendation && input.profile) {
        const originalStoreItem = storeCatalog.find(si => si.store_item_id === item.store_item_id);
        if (originalStoreItem) {
          // Re-call size recommendation function
          // Important: to avoid circular dependencies, this logic would ideally be in lookEngine or another util
          // For now, we'll simulate a simple call or let lookEngine already do it
          item.size_recommendation = `Sugestão de tamanho para ${item.brand_name}.`; // Generic fallback
        }
      }
       // ✅ NEW: Ensure brand_id, brand_name and fabric for user items if missing
      if (item.source === 'user' && item.wardrobe_item_id) {
        const originalUserItem = input.wardrobe.find(wi => wi.id === item.wardrobe_item_id);
        if (originalUserItem) {
          if (!item.brand_id) item.brand_id = originalUserItem.brand_id;
          if (!item.brand_name) item.brand_name = originalUserItem.brand_name;
          if (!item.fabric) item.fabric = originalUserItem.fabric; // ✅ NEW: Copy fabric
        }
      }
    }
    return look;
  });

  // Assign highlight if none was defined by the model (and there are looks)
  // This logic is now a fallback if neither the deterministic engine nor the AI define the highlight
  if (!highlightAssigned && looks.length > 0) {
    const expectedFormalidade = input.occasion.nivel_formalidade_esperado;
    let closestLookIndex = 0;
    let minDiff = Infinity;

    looks.forEach((look, index) => {
      const diff = Math.abs(look.formalidade_calculada - expectedFormalidade);
      if (diff < minDiff) {
        minDiff = diff;
        closestLookIndex = index;
      }
    });

    looks[closestLookIndex].highlight = 'formalidade-ideal';
    highlightAssigned = true;
  }


  // voice_text: final adjustment for consistency
  let voice = output.voice_text || '';

  if (isSellerMode) {
      if (!hasStore) {
        voice = `Olá! Parece que seu catálogo de produtos está vazio. Para gerar looks com itens do estoque da loja, por favor, cadastre alguns produtos. No momento, as sugestões são apenas genéricas. Qual look você gostaria de explorar para sua cliente?`;
      } else if (usedStore) {
        voice = `Aqui estão três looks que montei para sua cliente, utilizando peças disponíveis em nosso catálogo de produtos! Cada look é uma oportunidade de venda. Qual look você gostaria de apresentar à sua cliente primeiro?`;
      } else { // hasStore but didn't use store items (model failed?)
        voice = `Olá! Preparei três looks para sua cliente. Embora tenhamos um catálogo, não consegui montar looks apenas com itens do estoque. Sugestões externas foram usadas para completar. Por favor, revise o catálogo. Qual look você gostaria de apresentar?`;
      }
  } else { // Consumer Mode
      if (usedStore) {
        const hint = 'Algumas peças sugeridas vêm de lojas parceiras e podem ser adquiridas pelo botão Comprar.';
        if (!voice.toLowerCase().includes('comprar') && !voice.toLowerCase().includes('lojas parceiras')) {
          voice = `${voice} ${hint}`.trim();
        }
      } else if (!hasStore && looks.length > 0) { // If no store, and didn't use store (obviously)
         const hint = 'Para sugestões mais completas e compráveis, considere adicionar mais peças ao seu guarda-roupa ou cadastrar um catálogo de lojas parceiras.';
         if (!voice.toLowerCase().includes('compráveis') && !voice.toLowerCase().includes('lojas parceiras') && !voice.toLowerCase().includes('guardarroupa')) {
           voice = `${voice} ${hint}`.trim();
         }
      }
  }

  return { ...output, looks, voice_text: voice };
}

/**
 * Mock (fallback) for when no API key is available
 * -> keeps the MVP always running.
 */
function buildMockOutput(input: EStylistInput): EStylistOutput {
  const storeCatalog = input.store_catalog || [];
  const hasStore = storeCatalog.length > 0;
  const initialWardrobeItemCount = input.wardrobe.length;
  const isSellerMode = input.mode === 'seller';
  const profile = input.profile; // ✅ NEW

  let voiceText = '';

  if (isSellerMode) {
    if (hasStore) {
      voiceText = 'Aqui estão três looks que montei para sua cliente, utilizando peças disponíveis em nosso catálogo de produtos! Cada look é uma oportunidade de venda. Qual look você gostaria de apresentar à sua cliente primeiro?';
    } else {
      voiceText = `Olá! Parece que seu catálogo de produtos está vazio. Para gerar looks com itens do estoque da loja, por favor, cadastre alguns produtos. No momento, as sugestões são apenas genéricas. Qual look você gostaria de explorar para sua cliente?`;
    }
  } else { // Consumer Mode
    if (hasStore) {
      voiceText = 'Preparei três sugestões de looks para sua reunião. O primeiro é um casual de trabalho com toque moderno, usando peças do seu guarda-roupa, e é o look mais versátil. O segundo é uma elegância prática com vestido e inclui um colar que você pode comprar em uma loja parceira. Por fim, o terceiro foca no conforto com um estilo descontraído, também com uma calça de alfaiataria de uma loja parceira. Algumas peças sugeridas vêm de lojas parceiras e podem ser adquiridas pelo botão Comprar. Qual look você gostaria de explorar primeiro?';
    } else {
      voiceText = `Olá! Preparei três sugestões de looks para sua reunião, usando a ${input.wardrobe[0]?.name || 'peça do seu guarda-roupa'}. O primeiro é um casual de trabalho com toque moderno e é o look mais versátil. O segundo é uma elegância prática com vestido, e o terceiro foca no conforto e estilo descontraído. Para ter sugestões mais completas e ainda mais opções compráveis, sugiro que você cadastre mais peças no seu guarda-roupa, como uma calça e um calçado. Assim que tiver mais peças ou lojas parceiras, consigo montar combinações completas! Qual look você gostaria de explorar primeiro?`;
    }
  }


  const mockOutput: EStylistOutput = {
    looks: [
      {
        look_id: 'look_01',
        title: isSellerMode ? 'Sugestão de Venda: Conforto Elegante' : 'Casual de Trabalho com Toque Moderno',
        formalidade_calculada: 3,
        items: [
          ...(isSellerMode && !hasStore ? [] : [{ // If seller without store, don't put wardrobe item
            wardrobe_item_id: isSellerMode ? null : 'item_user_01', // Updated to match defaultConsumerInput
            name: isSellerMode ? (hasStore ? 'Blusa de Malha Leve' : 'Blusa Básica') : 'Camiseta Branca Básica',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/blusa-malha' : null,
            price: isSellerMode && hasStore ? 89.90 : null,
            installments: isSellerMode && hasStore ? '2x de R$44,95' : null,
            brand_id: isSellerMode && hasStore ? 'brand_mock_01' : 'marca_propria', // Updated to match defaultConsumerInput
            brand_name: isSellerMode && hasStore ? 'Marca Mock Loja' : 'Marca Própria', // Updated to match defaultConsumerInput
            fit_model: isSellerMode && hasStore ? 'Regular' : null, // Added fit_model
            fabric: isSellerMode && hasStore ? 'malha' : '100% algodão', // Added fabric
            size_recommendation: isSellerMode && hasStore ? 'Sugerimos Tam. M' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Peça curinga do nosso estoque, ideal para combinar com várias opções.',
              versatility: 'Excelente para o dia a dia e fácil de compor looks.',
              priority: 'essencial' as SalesPriority,
            } : null,
          }]),
          ...(
            // If Test A (consumer without store, 1 item), don't add more items here.
            // If seller mode, also adjust.
            (!hasStore && initialWardrobeItemCount === 1 && !isSellerMode) || (isSellerMode && !hasStore && initialWardrobeItemCount < 3) ? [] : [
            {
                wardrobe_item_id: null, // This would be a store item or generic
                name: isSellerMode ? (hasStore ? 'Calça Slim Azul Escuro' : 'Calça Reta') : 'Calça Jeans High Waist', // Updated to match defaultConsumerInput store item
                is_external: true, // Always external if not from user wardrobe
                source: hasStore ? 'store' as const : null,
                can_purchase: hasStore ? true : false,
                product_url: hasStore ? 'https://loja.com/p/calca-99' : null, // Updated to match defaultConsumerInput store item
                price: hasStore ? 289.90 : null, // Updated to match defaultConsumerInput store item
                installments: hasStore ? '3x de R$96,63' : null, // Updated to match defaultConsumerInput store item
                brand_id: hasStore ? 'marca_premium_01' : null, // Updated to match defaultConsumerInput store item
                brand_name: hasStore ? 'Levis Style' : null, // Updated to match defaultConsumerInput store item
                fit_model: hasStore ? 'Slim' : null, // Added fit_model
                fabric: hasStore ? '98% algodão, 2% elastano' : null, // Added fabric
                size_recommendation: hasStore ? 'Sugerimos Tam. 42' : null, // Updated to expected size recommendation
                sales_support: hasStore ? {
                  why_it_works: 'Modelagem moderna e tecido confortável, um best-seller da loja.',
                  versatility: 'Combina com blusas e camisas, perfeita para transitar entre looks.',
                  priority: 'essencial' as SalesPriority,
                } : null,
            },
            {
                wardrobe_item_id: null,
                name: isSellerMode ? (hasStore ? 'Blazer Acinturado Preto' : 'Blazer Elegante') : 'Blazer Preto Estruturado',
                is_external: true, // Assuming this is an external suggestion
                source: hasStore ? 'store' as const : null, // Can be store if available, else null
                can_purchase: hasStore ? true : false,
                product_url: isSellerMode && hasStore ? 'https://sualoja.com/blazer-preto' : null,
                price: isSellerMode && hasStore ? 299.90 : null,
                installments: isSellerMode && hasStore ? '5x de R$59,98' : null,
                brand_id: isSellerMode && hasStore ? 'brand_mock_03' : null,
                brand_name: isSellerMode && hasStore ? 'Marca Mock Loja 3' : null,
                fit_model: isSellerMode && hasStore ? 'Acinturado' : null, // Added fit_model
                fabric: isSellerMode && hasStore ? 'poliéster' : null, // Added fabric
                size_recommendation: isSellerMode && hasStore ? 'Sugerimos Tam. G' : null,
                sales_support: isSellerMode && hasStore ? {
                  why_it_works: 'Um clássico atemporal que eleva qualquer visual, sempre em estoque!',
                  versatility: 'Ideal para trabalho, eventos sociais e composições mais elaboradas.',
                  priority: 'essencial' as SalesPriority,
                } : null,
            }]
          )
        ].flat(), // flat to remove empty arrays
        why_it_works:
          (isSellerMode ? 'Para sua cliente, este look é composto por itens que temos em estoque. ' : '') +
          'A combinação da camiseta básica com o blazer eleva o jeans, tornando-o apropriado para uma reunião informal. O blazer adiciona estrutura e profissionalismo. As peças são do ' + (isSellerMode ? 'nosso estoque' : 'seu guarda-roupa') + '.',
        warnings: [
          ...(!hasStore && initialWardrobeItemCount === 1 && !isSellerMode ? ['Seu guarda-roupa tem poucas peças para esta ocasião. Cadastre mais itens, como uma calça e um calçado, para que eu possa montar looks completos.'] : []),
          ...(isSellerMode && !hasStore ? ['Estoque limitado: Não foi possível encontrar todas as peças em nosso catálogo. Sugestão externa para completar o look.'] : []),
        ],
        highlight: 'versatil',
      },
      {
        look_id: 'look_02',
        title: isSellerMode ? 'Sugestão de Venda: Vestido Versátil' : 'Elegância Prática com Vestido',
        formalidade_calculada: 4,
        items: [
          {
            wardrobe_item_id: null, // This is a store item or generic
            name: isSellerMode ? (hasStore ? 'Vestido Midi Estampado' : 'Vestido Floral') : 'Vestido Midi Floral',
            is_external: true, // External
            source: hasStore ? 'store' as const : null,
            can_purchase: hasStore ? true : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/vestido-midi' : null,
            price: isSellerMode && hasStore ? 199.90 : null,
            installments: isSellerMode && hasStore ? '4x de R$49,98' : null,
            brand_id: isSellerMode && hasStore ? 'brand_mock_04' : null,
            brand_name: isSellerMode && hasStore ? 'Marca Mock Loja 4' : null,
            fit_model: isSellerMode && hasStore ? 'Regular' : null, // Added fit_model
            fabric: isSellerMode && hasStore ? 'viscose' : null, // Added fabric
            size_recommendation: isSellerMode && hasStore ? 'Sugerimos Tam. M' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Um vestido que a cliente vai amar, disponível em diversas estampas na loja.',
              versatility: 'Pode ser usado com salto ou tênis, casual ou mais formal.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: null, // This is a store item or generic
            name: isSellerMode ? (hasStore ? 'Scarpin Clássico Preto' : 'Sapato de Salto') : 'Sapato Scarpin Preto',
            is_external: true, // External
            source: hasStore ? 'store' as const : null,
            can_purchase: hasStore ? true : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/scarpin-preto' : null,
            price: isSellerMode && hasStore ? 129.90 : null,
            installments: isSellerMode && hasStore ? '3x de R$43,30' : null,
            brand_id: isSellerMode && hasStore ? 'brand_mock_05' : null,
            brand_name: isSellerMode && hasStore ? 'Marca Mock Loja 5' : null,
            fit_model: isSellerMode && hasStore ? 'Classic' : null, // Added fit_model
            fabric: isSellerMode && hasStore ? 'couro sintético' : null, // Added fabric
            size_recommendation: isSellerMode && hasStore ? 'Sugerimos Tam. 37' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Essencial para um toque de elegância, sempre um sucesso de vendas.',
              versatility: 'Peça coringa para looks de trabalho e eventos sociais.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: null,
            store_item_id: hasStore ? 'store_004' : undefined,
            name: isSellerMode && hasStore ? 'Colar Minimalista Dourado' : 'Colar Elegante',
            is_external: true,
            source: isSellerMode && hasStore ? 'store' as const : null,
            can_purchase: hasStore ? true : false,
            product_url: hasStore ? 'https://acessoriosmania.com/colar-minimalista-dourado' : null,
            price: hasStore ? 79.99 : null,
            installments: hasStore ? '1x de R$79,99' : null,
            brand_id: hasStore ? 'brand_011' : null,
            brand_name: hasStore ? 'Brilho Único' : null,
            fit_model: hasStore ? 'N/A' : null, // Added fit_model
            fabric: hasStore ? 'metal' : null, // Added fabric
            size_recommendation: hasStore ? 'Tamanho único' : null,
            sales_support: hasStore ? {
              why_it_works: 'Um colar discreto adiciona um toque final elegante sem pesar o visual, perfeito para a reunião.',
              versatility: 'Pode ser usado com diversos decotes e estilos.',
              priority: 'opcional' as SalesPriority,
            } : undefined
          }
        ],
        why_it_works:
          (isSellerMode ? 'Para sua cliente, este vestido ${hasStore ? "do nosso estoque" : "externo"} ' : 'O vestido midi floral, por ser solto e de viscose, ') +
          `pode ser casual, mas com o scarpin preto ele ganha um toque de sofisticação. O colar ${hasStore ? 'da loja parceira' : 'externo'} complementa o look.`,
        warnings: [
          'A formalidade do scarpin preto e o vestido podem elevar um pouco o look acima do nível esperado para uma reunião puramente informal.',
          ...(isSellerMode && !hasStore ? ['Estoque limitado: Não foi possível encontrar todas as peças em nosso catálogo. Sugestão externa para completar o look.'] : []),
        ],
        highlight: null,
      },
      {
        look_id: 'look_03',
        title: isSellerMode ? 'Sugestão de Venda: Casual Chique' : 'Conforto e Estilo Descontraído',
        formalidade_calculada: 2,
        items: [
          {
            wardrobe_item_id: isSellerMode ? null : 'item_user_01', // Updated to match defaultConsumerInput
            name: isSellerMode ? (hasStore ? 'Camisa Viscose Branca' : 'Camisa Básica') : 'Camiseta Branca Básica',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/camisa-viscose' : null,
            price: isSellerMode && hasStore ? 119.90 : null,
            installments: isSellerMode && hasStore ? '2x de R$59,95' : null,
            brand_id: isSellerMode && hasStore ? 'brand_mock_06' : 'marca_propria', // Updated to match defaultConsumerInput
            brand_name: isSellerMode && hasStore ? 'Marca Mock Loja 6' : 'Marca Própria', // Updated to match defaultConsumerInput
            fit_model: isSellerMode && hasStore ? 'Regular' : null, // Added fit_model
            fabric: isSellerMode && hasStore ? 'viscose' : '100% algodão', // Added fabric
            size_recommendation: isSellerMode && hasStore ? 'Sugerimos Tam. P' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Um item versátil e fresco, sempre bem-vindo no guarda-roupa da cliente.',
              versatility: 'Fácil de combinar com saias, calças e shorts.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: null, // This is a store item or generic
            name: isSellerMode ? (hasStore ? 'Calça Jeans Skinny' : 'Calça Jeans Conforto') : 'Calça Jeans High Waist', // Updated to match defaultConsumerInput store item
            is_external: true, // External
            source: hasStore ? 'store' as const : null,
            can_purchase: hasStore ? true : false,
            product_url: hasStore ? 'https://loja.com/p/calca-99' : null, // Updated to match defaultConsumerInput store item
            price: hasStore ? 289.90 : null, // Updated to match defaultConsumerInput store item
            installments: hasStore ? '3x de R$96,63' : null, // Updated to match defaultConsumerInput store item
            brand_id: hasStore ? 'marca_premium_01' : null, // Updated to match defaultConsumerInput store item
            brand_name: hasStore ? 'Levis Style' : null, // Updated to match defaultConsumerInput store item
            fit_model: hasStore ? 'Slim' : null, // Added fit_model
            fabric: hasStore ? '98% algodão, 2% elastano' : null, // Added fabric
            size_recommendation: hasStore ? 'Sugerimos Tam. 42' : null, // Updated to expected size recommendation
            sales_support: hasStore ? {
              why_it_works: 'Modelagem moderna e muito procurada, um sucesso de vendas.',
              versatility: 'Perfeita para o dia a dia e combina com diversas blusas e calçados.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: null,
            name: isSellerMode ? (hasStore ? 'Tênis Urbano Branco' : 'Tênis Moderno') : 'Tênis Casual Branco',
            is_external: true,
            source: hasStore ? 'store' as const : null,
            can_purchase: hasStore ? true : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/tenis-urbano' : null,
            price: isSellerMode && hasStore ? 179.90 : null,
            installments: isSellerMode && hasStore ? '3x de R$59,97' : null,
            brand_id: isSellerMode && hasStore ? 'brand_mock_08' : null,
            brand_name: isSellerMode && hasStore ? 'Marca Mock Loja 8' : null,
            fit_model: isSellerMode && hasStore ? 'Casual' : null, // Added fit_model
            fabric: isSellerMode && hasStore ? 'lona' : null, // Added fabric
            size_recommendation: isSellerMode && hasStore ? 'Sugerimos Tam. 38' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'O conforto que a cliente busca, com o estilo que está em alta. Temos em várias numerações.',
              versatility: 'Ideal para looks casuais e esportivos, super tendência.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
        ],
        why_it_works:
          (isSellerMode ? 'Para sua cliente, este é um conjunto prático com peças do nosso estoque. ' : '') +
          `Um conjunto simples e direto, com o tênis trazendo conforto. A calça de alfaiataria ${hasStore ? 'da loja parceira' : 'sugerida'} é uma opção versátil para elevar o look.`,
        warnings: [
          'Este look é mais casual, ficando abaixo do nível de formalidade esperado (3) para a ocasião, sendo adequado apenas para ambientes de trabalho extremamente informais.',
          ...(isSellerMode && !hasStore ? ['Estoque limitado: Não foi possível encontrar todas as peças em nosso catálogo. Sugestão externa para completar o look.'] : []),
        ],
        highlight: null,
      },
    ],
    voice_text: voiceText,
    next_question: '',
  };

  return mockOutput;
}

// NOVO: Simula um armazenamento de backend para looks compartilhados
// Em um app real, isso seria um Map<token, Look> gerenciado no backend.
// Aqui, é um Map in-memory do frontend para simular a funcionalidade.
const _sharedLookStore = new Map<string, SharedLinkData>(); // Modificado para armazenar SharedLinkData

export const eStylistService = {
  async generateLooks(input: EStylistInput): Promise<EStylistOutput> {
    // Pequeno delay só para UX (pode remover)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 1) Geração determinística (baseOutput)
    // Isso é análogo a consultar 'knowledge_rules' ou 'look_templates' no DB
    let baseOutput: EStylistOutput = applyTemplates(buildLooksDeterministic(input));

    // 2) Normalização da consulta para a chave do cache (simulando input_hash)
    // Em um backend real, isso seria um hash consistente do JSON normalizado.
    // Para o frontend, JSON.stringify direto é "suficiente" se a ordem das chaves for estável.
    const cacheKey = 'estylist:' + btoa(unescape(encodeURIComponent(JSON.stringify(input))));

    // 3) Busca no Cache (localStorage) - Simula o padrão "DB First"
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        // Validar se o cache é 'bom' - aqui, apenas verifica se é um JSON válido e tem o formato esperado
        if (validateOutputShape(parsedCache, input)) { // ✅ Passa input para validação robusta
          console.log('Cache Hit: Retornando resposta do localStorage.');
          // Aplica fallback/enriquecimento para garantir consistência de highlights/voice_text/sales_support
          return enrichWithStoreOrTextFallback(parsedCache, input);
        } else {
          console.warn('Cache inválido ou desatualizado, regerando.', parsedCache);
          localStorage.removeItem(cacheKey); // Remove cache inválido
        }
      } catch (e) {
        console.warn('Falha ao analisar item do cache, regerando.', e);
        localStorage.removeItem(cacheKey); // Remove cache inválido
      }
    }
    console.log('Cache Miss: Gerando nova resposta.');

    // 4) Se Smart Copy habilitado, chama o backend para refinamento com IA
    if (input.smart_copy) {
      try {
        console.log('Chamando backend para refinar textos...');
        const response = await api.post('/api/looks/refinar-texto', { baseOutput });
        const parsed: EStylistOutput = response.data;

        if (!validateOutputShape(parsed, input)) {
          console.error('Resposta do backend (IA) fora do formato esperado (EStylistOutput):', parsed);
          // Em caso de validação falha, retorna a base determinística
          localStorage.setItem(cacheKey, JSON.stringify(baseOutput));
          return enrichWithStoreOrTextFallback(baseOutput, input);
        }

        // Salva a resposta da IA no cache antes de retornar
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
        // Aplica o enriquecimento final para garantir consistência
        return enrichWithStoreOrTextFallback(parsed, input);

      } catch (err: any) {
        console.error('Erro ao chamar backend para refinar textos:', err);
        // Fallback seguro: não derruba o app, retorna o output determinístico
        localStorage.setItem(cacheKey, JSON.stringify(baseOutput));
        return enrichWithStoreOrTextFallback(baseOutput, input);
      }
    }

    // 5) Retorno padrão: output determinístico (se smart_copy=false ou sem API key/erro AI)
    // Salva o output determinístico no cache antes de retornar
    localStorage.setItem(cacheKey, JSON.stringify(baseOutput));
    return enrichWithStoreOrTextFallback(baseOutput, input);
  },

  // NOVO: Simula a criação de um link de compartilhamento no backend
  async createShareLink(look: Look, profile: Profile, scope: ShareScope): Promise<string> {
    // Gerar um token simples (UUID real seria melhor)
    const token = 'shared-' + Math.random().toString(36).substring(2, 15);
    _sharedLookStore.set(token, { look, profile }); // Armazena o look E o perfil no nosso "pseudo-backend"

    // Retorna o URL completo para o look compartilhado
    // Assume que a PWA está em window.location.origin
    const shareUrl = `${window.location.origin}/s/${token}`;
    console.log(`Share Link gerado: ${shareUrl} (Scope: ${scope})`);
    return shareUrl;
  },

  // NOVO: Simula a recuperação de um look compartilhado do backend
  async getSharedLook(token: string): Promise<SharedLinkData | null> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = _sharedLookStore.get(token);
    if (data) {
      console.log(`Look e Profile recuperados para o token: ${token}`);
    } else {
      console.warn(`Nenhum look encontrado para o token: ${token}`);
    }
    return data || null;
  }
};