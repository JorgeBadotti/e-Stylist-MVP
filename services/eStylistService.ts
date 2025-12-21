// services/eStylistService.ts

import { EStylistInput, EStylistOutput, LookItem, ItemSource, SalesPriority, StoreItem, LookHighlight, EStylistMode, Look, ShareScope, Occasion } from '../types'; // NOVO: Occasion importado
// ✅ SDK oficial (já funciona no template do AI Studio quando habilitado)
import { GoogleGenAI } from '@google/genai';

// ✅ NOVOS: Importa o motor determinístico e os templates de cópia
import { buildLooksDeterministic } from './lookEngine';
import { applyTemplates } from './copyTemplates';

/**
 * System Instruction definitivo (MVP)
 * - Determinístico
 * - Não inventa dados
 * - Retorna APENAS JSON
 */
const SYSTEM_INSTRUCTION = `
Você é o e-Stylist MVP, um assistente de styling pessoal inteligente.

Sua missão é criar looks coerentes, explicáveis e acessíveis, usando exclusivamente os dados fornecidos no input.
Você atua como:
- Consultor de moda prática
- Avaliador de harmonia e formalidade
- Assistente acessível (voz)
- Sistema determinístico para MVP (respostas previsíveis)

🧠 OBJETIVO PRINCIPAL:
Dado:
- um perfil de cliente
- um guarda-roupa limitado (se modo for 'consumer')
- um catálogo de lojas (se modo for 'seller' ou 'consumer')
- uma ocasião específica
- um "mode" ('consumer' ou 'seller')

Você deve gerar exatamente 3 looks, explicando por que funcionam, alertando conflitos quando existirem e produzindo um texto pronto para leitura em voz alta.

📏 REGRAS OBRIGATÓRIAS (NÃO NEGOCIÁVEIS):
1) NUNCA invente peças, cores, tecidos, categorias ou estilos que não estejam explicitamente no "wardrobe" ou no "store_catalog".
2) Para a intent "create_looks", gere EXATAMENTE 3 looks. Nem mais, nem menos.
3) Cada look DEVE conter obrigatoriamente:
   - "look_id" sequencial (look_01, look_02, look_03)
   - "title" curto e descritivo
   - "formalidade_calculada" (1 a 5)
   - "items" (peças do guarda-roupa ou loja, ou sugestões externas genéricas)
   - "why_it_works" → explicação clara, objetiva, sem jargão técnico
   - "warnings" → lista vazia se não houver problemas
   - "highlight" → APENAS UM dos 3 looks deve ter um highlight ("versatil", "custo-beneficio", "formalidade-ideal"). Os outros dois looks devem ter "highlight": null.

4) Para cada item dentro de "items", as regras variam com o "mode":

   --- Se "mode": "consumer" (usuário final) ---
   - Prioridade: 1º guarda-roupa do cliente, 2º catálogo de lojas, 3º sugestões genéricas externas.
   - Para peça do "wardrobe" (guarda-roupa do cliente):
     - "wardrobe_item_id": preenchido com o ID do item, "is_external": false, "source": "user", "can_purchase": false.
     - Campos de loja (store_item_id, product_url, price, installments, sales_support) DEVEM ser NULOS.
   - Para peça que FALTA no "wardrobe" mas está disponível no "store_catalog":
     - "wardrobe_item_id": null, "store_item_id": ID da loja, "name": nome da loja, "is_external": true, "source": "store", "can_purchase": true.
     - "product_url", "price", "installments" preenchidos do "store_catalog".
     - "sales_support": DEVE ser preenchido com:
       - "why_it_works": uma justificativa clara de por que essa peça é boa para o look/cliente.
       - "versatility": explicação sobre a versatilidade da peça.
       - "priority": "essencial" ou "opcional".
   - Para peça que FALTA e NÃO está no "store_catalog":
     - "wardrobe_item_id": null, "store_item_id": null, "name": nome genérico, "is_external": true, "source": null, "can_purchase": false.
     - Campos de compra/venda (product_url, price, installments, sales_support) DEVEM ser NULOS.

   --- Se "mode": "seller" (vendedor de loja) ---
   - O guarda-roupa do cliente ("wardrobe") é APENAS para referência de ESTILO e PREFERÊNCIAS. NÃO use-o como inventário para os looks.
   - Prioridade: 1º catálogo de lojas ("store_catalog").
   - Todos os "items" nos looks DEVEM vir do "store_catalog". Se não houver itens suficientes no "store_catalog" para um look completo (pelo menos 3 itens), você DEVE:
     - Incluir os itens do "store_catalog" que conseguiu encontrar.
     - Completar o look com sugestões genéricas externas (ex: "Bolsa Preta") se necessário, marcando "is_external": true, "source": null, "can_purchase": false.
     - Adicionar um "warning" específico sobre "estoque limitado" ou "sugestão externa para completar o look" no campo "warnings" do look.
   - Para peça do "store_catalog":
     - "wardrobe_item_id": null, "store_item_id": ID da loja, "name": nome da loja, "is_external": true, "source": "store", "can_purchase": true.
     - "product_url", "price", "installments" preenchidos do "store_catalog".
     - "sales_support": DEVE ser preenchido com:
       - "why_it_works": uma justificativa clara de por que essa peça é boa para o look/cliente.
       - "versatility": explicação sobre a versatilidade da peça.
       - "priority": "essencial" ou "opcional".
   - Para peça genérica externa (se "store_catalog" insuficiente):
     - "wardrobe_item_id": null, "store_item_id": null, "name": nome genérico,
     - "is_external": true, "source": null, "can_purchase": false.
     - Campos de compra/venda (product_url, price, installments, sales_support) DEVEM ser NULOS.
   - NENHUMA peça do "wardrobe" do cliente DEVE aparecer nos "items" dos looks no "seller" mode.

   --- Regras Comuns para AMBOS os modos ---
   - O campo "why_it_works" (do look) DEVE mencionar CLARAMENTE a origem de cada item (guarda-roupa, loja ou sugestão externa genérica).
   - A formalidade do look ("formalidade_calculada") deve estar dentro de ±1 do "nivel_formalidade_esperado" da ocasião. Se estiver fora, adicione alerta em "warnings" explicando o motivo.

5) Acessibilidade (obrigatório):
   - Sempre gere o campo "voice_text".
   - O texto deve: estar em português, ser natural para leitura em voz alta, explicar os 3 looks e orientar a navegação (ex: “diga próximo look”).
   - Se itens de loja forem usados, o "voice_text" DEVE mencionar que essas peças podem ser adquiridas e que há um botão "Comprar".
   - Se NÃO houver "store_catalog" no input E o modo for 'consumer', o "voice_text" DEVE adotar um tom "vendedor" e educativo, sugerindo o cadastro de peças ou um catálogo de lojas parceiras para completar looks futuros, mas SEM vender produtos inexistentes.
   - Se NÃO houver "store_catalog" no input E o modo for 'seller', o "voice_text" DEVE informar sobre a falta de estoque no catálogo e sugerir o cadastro de produtos.

6) "next_question": use somente se faltar informação essencial. Se nada faltar, retorne "" (string vazia). Nunca faça perguntas desnecessárias.

7) Retorne APENAS JSON válido. NUNCA escreva absolutamente nada fora do JSON.
8) NUNCA use "is_external: true" com "source: 'user'". Esta combinação é PROIBIDA.
9) NUNCA use "wardrobe_item_id" preenchido no "seller" mode. Esta combinação é PROIBIDA.

Você deve responder EXCLUSIVAMENTE com um JSON no seguinte formato:
{
  "looks": [
    {
      "look_id": "string",
      "title": "string",
      "formalidade_calculada": 1,
      "items": [
        {
          "wardrobe_item_id": "string | null",
          "store_item_id": "string | null",
          "name": "string",
          "is_external": boolean,
          "source": "user" | "store" | null,
          "can_purchase": boolean,
          "product_url": "string | null",
          "price": number | null,
          "installments": "string | null",
          "sales_support": {
            "why_it_works": "string",
            "versatility": "string",
            "priority": "essencial" | "opcional"
          } | null
        }
      ],
      "why_it_works": "string",
      "warnings": ["string"],
      "highlight": "versatil" | "custo-beneficio" | "formalidade-ideal" | null
    }
  ],
  "voice_text": "string",
  "next_question": "string"
}
`;

/**
 * Pega a API KEY do jeito mais compatível possível.
 *
 * A API key DEVE ser obtida EXCLUSIVAMENTE de `process.env.API_KEY`.
 * Assume-se que esta variável é pré-configurada, válida e acessível.
 *
 * Em ambientes de navegador puros, 'process' pode ser indefinido.
 * Verificamos a existência de 'process' antes de tentar acessar 'process.env'
 * para evitar erros de execução em tempo real.
 *
 * @returns {string | undefined} A API Key se encontrada, caso contrário, `undefined`.
 */
function getApiKey(): string | undefined {
  if (typeof process !== 'undefined' && (process as any)?.env?.API_KEY) {
    const nodeKey = (process as any).env.API_KEY;
    if (nodeKey && typeof nodeKey === 'string') {
      return nodeKey;
    }
  }

  // Se 'process' não existe ou 'process.env.API_KEY' não está definido/é inválido,
  // retorna undefined. O `eStylistService.generateLooks` já lida com este caso
  // fazendo fallback para o output determinístico.
  return undefined;
}

/**
 * Extrai JSON “limpo” caso o modelo venha com algum wrapper.
 */
function extractJson(text: string): string {
  const trimmed = text.trim();

  // caso já seja JSON puro
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  // tenta localizar o primeiro bloco JSON
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
}

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
        } else { // Cenário padrão sem loja (consumer), mas com mais de 1 item no guarda-roupa ou com intenção de completar
            // Se não há loja e há poucos itens no guarda-roupa, mas não é o Teste A estrito,
            // esperamos que `enrichWithStoreOrTextFallback` tenha adicionado sugestões genéricas, então `items.length` pode ser > 1.
            // Apenas garantimos que não haja itens compráveis.
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

// Funções utilitárias fornecidas pelo usuário (não usada diretamente aqui, mas em lookEngine)
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
  // const initialWardrobeItemCount = input.wardrobe.length; // Não mais usado diretamente aqui
  const isSellerMode = input.mode === 'seller';

  let usedStore = false; // Flag para rastrear se itens de loja foram usados
  let highlightAssigned = false;

  const looks = output.looks.map((look) => {
    // Garantir que highlight seja nulo se não for um tipo válido
    if (look.highlight && !['versatil', 'custo-beneficio', 'formalidade-ideal'].includes(look.highlight)) {
      look.highlight = null; // Set to null instead of undefined
    } else if (look.highlight) {
      highlightAssigned = true;
    }

    // Verifica se algum item de loja foi usado
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
    }
    return look;
  });

  // Atribuir highlight se nenhum foi definido pelo modelo (e houver looks)
  // Esta lógica agora é um fallback caso nem o motor determinístico nem a IA definam o highlight
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


  // voice_text: ajuste final para consistência
  let voice = output.voice_text || '';

  if (isSellerMode) {
      if (!hasStore) {
        voice = `Olá! Parece que seu catálogo de produtos está vazio. Para gerar looks com itens do estoque da loja, por favor, cadastre alguns produtos. No momento, as sugestões são apenas genéricas. Qual look você gostaria de explorar para sua cliente?`;
      } else if (usedStore) {
        voice = `Aqui estão três looks que montei para sua cliente, utilizando peças disponíveis em nosso catálogo de produtos! Cada look é uma oportunidade de venda. Qual look você gostaria de apresentar à sua cliente primeiro?`;
      } else { // hasStore mas não usou store items (modelo falhou?)
        voice = `Olá! Preparei três looks para sua cliente. Embora tenhamos um catálogo, não consegui montar looks apenas com itens do estoque. Sugestões externas foram usadas para completar. Por favor, revise o catálogo. Qual look você gostaria de apresentar?`;
      }
  } else { // Consumer Mode
      if (usedStore) {
        const hint = 'Algumas peças sugeridas vêm de lojas parceiras e podem ser adquiridas pelo botão Comprar.';
        if (!voice.toLowerCase().includes('comprar') && !voice.toLowerCase().includes('lojas parceiras')) {
          voice = `${voice} ${hint}`.trim();
        }
      } else if (!hasStore && looks.length > 0) { // Se não há loja, e não usou loja (obviamente)
         const hint = 'Para sugestões mais completas e compráveis, considere adicionar mais peças ao seu guarda-roupa ou cadastrar um catálogo de lojas parceiras.';
         if (!voice.toLowerCase().includes('compráveis') && !voice.toLowerCase().includes('lojas parceiras') && !voice.toLowerCase().includes('guardarroupa')) {
           voice = `${voice} ${hint}`.trim();
         }
      }
  }

  return { ...output, looks, voice_text: voice };
}

/**
 * Mock (fallback) para quando não houver API key
 * -> mantém o MVP sempre funcionando.
 */
function buildMockOutput(input: EStylistInput): EStylistOutput {
  const storeCatalog = input.store_catalog || [];
  const hasStore = storeCatalog.length > 0;
  const initialWardrobeItemCount = input.wardrobe.length;
  const isSellerMode = input.mode === 'seller';

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
          ...(isSellerMode && !hasStore ? [] : [{ // Se seller sem loja, não põe item de guarda-roupa
            wardrobe_item_id: isSellerMode ? null : 'item_01',
            name: isSellerMode ? (hasStore ? 'Blusa de Malha Leve' : 'Blusa Básica') : 'Camiseta Branca Básica',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/blusa-malha' : null,
            price: isSellerMode && hasStore ? 89.90 : null,
            installments: isSellerMode && hasStore ? '2x de R$44,95' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Peça curinga do nosso estoque, ideal para combinar com várias opções.',
              versatility: 'Excelente para o dia a dia e fácil de compor looks.',
              priority: 'essencial' as SalesPriority,
            } : null,
          }]),
          ...(
            // Se for Teste A (consumer sem loja, 1 item), não adiciona mais itens aqui.
            // Se for seller mode, também ajusta.
            (!hasStore && initialWardrobeItemCount === 1 && !isSellerMode) || (isSellerMode && !hasStore && initialWardrobeItemCount < 3) ? [] : [
            {
                wardrobe_item_id: isSellerMode ? null : 'item_02',
                name: isSellerMode ? (hasStore ? 'Calça Slim Azul Escuro' : 'Calça Reta') : 'Calça Jeans Reta',
                is_external: isSellerMode || false,
                source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
                can_purchase: isSellerMode ? hasStore : false,
                product_url: isSellerMode && hasStore ? 'https://sualoja.com/calca-slim' : null,
                price: isSellerMode && hasStore ? 159.90 : null,
                installments: isSellerMode && hasStore ? '3x de R$53,30' : null,
                sales_support: isSellerMode && hasStore ? {
                  why_it_works: 'Modelagem moderna e tecido confortável, um best-seller da loja.',
                  versatility: 'Combina com blusas e camisas, perfeita para transitar entre looks.',
                  priority: 'essencial' as SalesPriority,
                } : null,
            },
            {
                wardrobe_item_id: isSellerMode ? null : 'item_03',
                name: isSellerMode ? (hasStore ? 'Blazer Acinturado Preto' : 'Blazer Elegante') : 'Blazer Preto Estruturado',
                is_external: isSellerMode || false,
                source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
                can_purchase: isSellerMode ? hasStore : false,
                product_url: isSellerMode && hasStore ? 'https://sualoja.com/blazer-preto' : null,
                price: isSellerMode && hasStore ? 299.90 : null,
                installments: isSellerMode && hasStore ? '5x de R$59,98' : null,
                sales_support: isSellerMode && hasStore ? {
                  why_it_works: 'Um clássico atemporal que eleva qualquer visual, sempre em estoque!',
                  versatility: 'Ideal para trabalho, eventos sociais e composições mais elaboradas.',
                  priority: 'essencial' as SalesPriority,
                } : null,
            }]
          )
        ].flat(), // flat para remover arrays vazios
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
            wardrobe_item_id: isSellerMode ? null : 'item_05',
            name: isSellerMode ? (hasStore ? 'Vestido Midi Estampado' : 'Vestido Floral') : 'Vestido Midi Floral',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/vestido-midi' : null,
            price: isSellerMode && hasStore ? 199.90 : null,
            installments: isSellerMode && hasStore ? '4x de R$49,98' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Um vestido que a cliente vai amar, disponível em diversas estampas na loja.',
              versatility: 'Pode ser usado com salto ou tênis, casual ou mais formal.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: isSellerMode ? null : 'item_04',
            name: isSellerMode ? (hasStore ? 'Scarpin Clássico Preto' : 'Sapato de Salto') : 'Sapato Scarpin Preto',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/scarpin-preto' : null,
            price: isSellerMode && hasStore ? 129.90 : null,
            installments: isSellerMode && hasStore ? '3x de R$43,30' : null,
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
            wardrobe_item_id: isSellerMode ? null : 'item_01',
            name: isSellerMode ? (hasStore ? 'Camisa Viscose Branca' : 'Camisa Básica') : 'Camiseta Branca Básica',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/camisa-viscose' : null,
            price: isSellerMode && hasStore ? 119.90 : null,
            installments: isSellerMode && hasStore ? '2x de R$59,95' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Um item versátil e fresco, sempre bem-vindo no guarda-roupa da cliente.',
              versatility: 'Fácil de combinar com saias, calças e shorts.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: isSellerMode ? null : 'item_02',
            name: isSellerMode ? (hasStore ? 'Calça Jeans Skinny' : 'Calça Jeans Conforto') : 'Calça Jeans Reta',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/calca-jeans-skinny' : null,
            price: isSellerMode && hasStore ? 149.90 : null,
            installments: isSellerMode && hasStore ? '3x de R$49,97' : null,
            sales_support: isSellerMode && hasStore ? {
              why_it_works: 'Modelagem moderna e muito procurada, um sucesso de vendas.',
              versatility: 'Perfeita para o dia a dia e combina com diversas blusas e calçados.',
              priority: 'essencial' as SalesPriority,
            } : null,
          },
          {
            wardrobe_item_id: isSellerMode ? null : 'item_06',
            name: isSellerMode ? (hasStore ? 'Tênis Urbano Branco' : 'Tênis Moderno') : 'Tênis Casual Branco',
            is_external: isSellerMode || false,
            source: isSellerMode ? (hasStore ? 'store' as const : null) : 'user' as const,
            can_purchase: isSellerMode ? hasStore : false,
            product_url: isSellerMode && hasStore ? 'https://sualoja.com/tenis-urbano' : null,
            price: isSellerMode && hasStore ? 179.90 : null,
            installments: isSellerMode && hasStore ? '3x de R$59,97' : null,
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
const _sharedLookStore = new Map<string, Look>();

// NOVO: Função para rastrear eventos de analytics
export function trackEvent(eventName: string, payload?: object) {
  console.log(`ANALYTICS EVENT: ${eventName}`, payload);
  // Em um app real, aqui você integraria com Google Analytics, Amplitude, etc.
  // Ex: window.gtag('event', eventName, payload);
}

export const eStylistService = {
  async generateLooks(input: EStylistInput): Promise<EStylistOutput> {
    // Pequeno delay só para UX (pode remover)
    await new Promise((resolve) => setTimeout(resolve, 500)); // Delay aumentado para simular processamento

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
          trackEvent('look_cache_hit', { inputProfile: input.profile.name });
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
    trackEvent('look_cache_miss', { inputProfile: input.profile.name });
    console.log('Cache Miss: Gerando nova resposta.');

    // 4) Se Smart Copy habilitado e API Key presente, chama a IA para refinamento
    if (input.smart_copy) {
      const apiKey = getApiKey();

      if (!apiKey) {
        trackEvent('smart_copy_skipped_no_api_key');
        console.warn('API Key não encontrada. Retornando output determinístico mesmo com smart_copy habilitado.');
        // Salva o output determinístico no cache antes de retornar
        localStorage.setItem(cacheKey, JSON.stringify(baseOutput));
        return enrichWithStoreOrTextFallback(baseOutput, input);
      }

      try {
        trackEvent('gemini_api_call_started', { inputProfile: input.profile.name });
        const genAI = new GoogleGenAI({ apiKey: apiKey });

        const prompt = `
Reescreva APENAS os textos para vender melhor sem exagero, SEM alterar os itens (array "items").
Mantenha a formalidade calculada e as flags de externalidade/compra.
Entrada (JSON dos looks gerados deterministicamente):
${JSON.stringify(baseOutput)}

Regras:
- NÃO adicione ou remova objetos dentro do array "items" de cada look.
- NÃO altere os valores de "wardrobe_item_id", "store_item_id", "is_external", "source", "can_purchase", "product_url", "price", "installments".
- Melhore os textos de: "why_it_works" (do look), "sales_support.why_it_works" (dos itens da loja), "sales_support.versatility", "voice_text", "next_question".
- Garanta que a formalidade calculada do look seja mantida (não reavalie).
- Retorne APENAS o JSON COMPLETO e VÁLIDO no formato especificado.
`;

        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash', // Model name directly
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION, // System instruction inside config
            temperature: 0.7, // Um pouco mais criativo para textos
            responseMimeType: 'application/json',
          },
        });

        const rawText = result.text; // Corrigido para acessar a propriedade .text
        const jsonText = extractJson(rawText);

        let parsed: EStylistOutput;
        try {
          parsed = JSON.parse(jsonText);
        } catch (parseError: any) {
          trackEvent('gemini_api_parse_error', { error: parseError.message, rawText: jsonText.substring(0, 200) });
          console.error('Falha ao analisar resposta JSON do Gemini:', jsonText, parseError);
          // Em caso de erro de parsing, retorna a base determinística
          // Salva o output determinístico no cache antes de retornar
          localStorage.setItem(cacheKey, JSON.stringify(baseOutput));
          return enrichWithStoreOrTextFallback(baseOutput, input);
        }

        if (!validateOutputShape(parsed, input)) { // ✅ Passa input para validação robusta
          trackEvent('gemini_api_validation_error', { error: 'Invalid output shape', output: parsed });
          console.error('Resposta do modelo fora do formato esperado (EStylistOutput):', parsed);
          // Em caso de validação falha, retorna a base determinística
          // Salva o output determinístico no cache antes de retornar
          localStorage.setItem(cacheKey, JSON.stringify(baseOutput));
          return enrichWithStoreOrTextFallback(baseOutput, input);
        }

        trackEvent('gemini_api_call_success', { inputProfile: input.profile.name });
        // Salva a resposta da IA no cache antes de retornar
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
        // Aplica o enriquecimento final para garantir consistência
        return enrichWithStoreOrTextFallback(parsed, input);

      } catch (err: any) {
        trackEvent('gemini_api_call_failed', { error: err.message });
        console.error('Erro no Gemini:', err);
        // Fallback seguro: não derruba o app, retorna o output determinístico
        // Salva o output determinístico no cache antes de retornar
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
  async createShareLink(look: Look, scope: ShareScope): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simula delay de rede

    // Gerar um token simples (UUID real seria melhor)
    const token = 'shared-' + Math.random().toString(36).substring(2, 15);
    _sharedLookStore.set(token, look); // Armazena o look no nosso "pseudo-backend"

    // Retorna o URL completo para o look compartilhado
    // Assume que a PWA está em window.location.origin
    const shareUrl = `${window.location.origin}/s/${token}`;
    trackEvent('share_link_created', { lookId: look.look_id, scope, token, shareUrl });
    console.log(`Share Link gerado: ${shareUrl} (Scope: ${scope})`);
    return shareUrl;
  },

  // NOVO: Simula a recuperação de um look compartilhado do backend
  async getSharedLook(token: string): Promise<Look | null> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 700)); // Aumentado para simular latência de rede/DB
    const look = _sharedLookStore.get(token);
    if (look) {
      trackEvent('shared_look_retrieved_success', { token, lookId: look.look_id });
      console.log(`Look recuperado para o token: ${token}`);
    } else {
      trackEvent('shared_look_retrieved_fail', { token, reason: 'not_found' });
      console.warn(`Nenhum look encontrado para o token: ${token}`);
    }
    return look || null;
  },

  // NOVO: Lista de ocasiões para o fluxo de compartilhamento
  getOccasions(): Occasion[] {
    return [
      { id: 'shared_ocasiao_001', name: 'Trabalho Casual', nivel_formalidade_esperado: 3 },
      { id: 'shared_ocasiao_002', name: 'Evento Social', nivel_formalidade_esperado: 4 },
      { id: 'shared_ocasiao_003', name: 'Passeio com Amigos', nivel_formalidade_esperado: 2 },
      { id: 'shared_ocasiao_004', name: 'Jantar Romântico', nivel_formalidade_esperado: 5 },
      { id: 'shared_ocasiao_005', name: 'Dia a Dia Leve', nivel_formalidade_esperado: 1 },
    ];
  }
};