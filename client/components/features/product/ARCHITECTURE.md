/**
 * ARQUITETURA DO MÓDULO CADASTRO PRODUTO
 * 
 * ============================================================================
 * CAMADAS
 * ============================================================================
 * 
 * 1. HOOKS (Lógica + Estado)
 *    ├── useProductForm          → Gerencia dados do formulário
 *    ├── useDicionarios          → Carrega dicionários do backend
 *    ├── useProductValidation    → Valida campos do formulário
 *    └── useProductSubmit        → Gerencia submissão e erros
 * 
 * 2. COMPONENTS HELPERS (UI)
 *    ├── FormHeader              → Título + subtítulo
 *    ├── FormMessages            → Mostra erros/sucesso
 *    ├── FormActions             → Botões submit/cancel
 *    └── LoadingSpinner          → Spinner de carregamento
 * 
 * 3. COMPONENTS SECTIONS (Agrupam campos por categoria)
 *    ├── FormProductIdentification  → Categoria, Linha, Cor, Tamanho
 *    ├── FormProductSKU             → Layer, Color, Fit, Style
 *    ├── FormProductDetails         → Nome, Descrição, Imagem
 *    ├── FormProductAttributes      → Silhueta, Comprimento, etc
 *    └── FormProductSpecs           → Temperatura, Material, etc
 * 
 * 4. COMPONENTS INPUTS (Campos individuais)
 *    ├── InputSelect              → Dropdown com opções
 *    ├── InputText                → Texto
 *    ├── InputNumber              → Número
 *    ├── InputFile                → Upload de imagem
 *    ├── InputGroup               → Grid responsivo
 *    └── TextArea                 → Área de texto
 * 
 * 5. TYPES (Tipos e interfaces)
 *    ├── DadosProduto             → Dados do produto (23 campos)
 *    ├── Dicionario               → Item de dicionário
 *    ├── ProductPayload           → Payload para API
 *    └── DicionariosMap           → Mapa de dicionários
 * 
 * ============================================================================
 * FLUXO DE DADOS
 * ============================================================================
 * 
 *   ┌─────────────────────────────────────────┐
 *   │    CadastroProdutoSKU.tsx (129 linhas)  │
 *   │                                         │
 *   │  • Orquestra todos os hooks             │
 *   │  • Renderiza seções e helpers           │
 *   │  • Passa props aos components           │
 *   └────┬────────────────────────────────────┘
 *        │
 *        ├─→ useDicionarios()
 *        │   └─→ Fetch /api/produtos/dicionarios
 *        │       └─→ dicionarios: DicionariosMap
 *        │
 *        ├─→ useProductForm()
 *        │   └─→ dados: DadosProduto
 *        │       └─→ handleChange, updateFormData
 *        │
 *        ├─→ useProductValidation()
 *        │   └─→ validarFormulario(dados)
 *        │       └─→ string[]
 *        │
 *        └─→ useProductSubmit(lojaId)
 *            └─→ handleSubmit(e, dados, validarFormulario)
 *                └─→ Fetch POST /api/produtos
 *                    └─→ FormData (campos + imagem)
 * 
 * ============================================================================
 * COMPONENTES E SUAS RESPONSABILIDADES
 * ============================================================================
 * 
 * CadastroProdutoSKU.tsx
 *   ↓
 *   ├── FormHeader
 *   │   └─→ Renderiza título do formulário
 *   │
 *   ├── FormMessages
 *   │   └─→ Mostra mensagens de erro e sucesso
 *   │
 *   ├── FormProductIdentification
 *   │   ├─→ InputSelect (Categoria)
 *   │   ├─→ InputSelect (Linha)
 *   │   ├─→ InputSelect (Cor)
 *   │   └─→ InputSelect (Tamanho)
 *   │
 *   ├── FormProductSKU
 *   │   ├─→ InputSelect (Layer Role)
 *   │   ├─→ InputSelect (Color Role)
 *   │   ├─→ InputSelect (Fit) [fixed options]
 *   │   └─→ InputSelect (Style Base) [fixed options]
 *   │
 *   ├── FormProductDetails
 *   │   ├─→ InputText (Nome)
 *   │   ├─→ TextArea (Descrição)
 *   │   └─→ InputFile (Imagem) [com preview]
 *   │
 *   ├── FormProductAttributes
 *   │   ├─→ InputSelect (Silhueta)
 *   │   ├─→ InputSelect (Comprimento)
 *   │   ├─→ InputSelect (Posição Cintura)
 *   │   ├─→ InputSelect (Ocasião)
 *   │   └─→ InputSelect (Estação)
 *   │
 *   ├── FormProductSpecs
 *   │   ├─→ InputSelect (Temperatura)
 *   │   ├─→ InputSelect (Material)
 *   │   ├─→ InputNumber (Eco Score)
 *   │   ├─→ InputNumber (Care Level)
 *   │   ├─→ InputSelect (Faixa Preço)
 *   │   ├─→ Checkbox (Peça Hero)
 *   │   └─→ InputSelect (Classe Margem) [fixed options]
 *   │
 *   └── FormActions
 *       ├─→ Button (Criar Produto)
 *       └─→ Button (Cancelar)
 * 
 * ============================================================================
 * MÉTRICAS DE QUALIDADE
 * ============================================================================
 * 
 * Componente Principal:
 *   • Antes: 316 linhas (lógica + UI + validação + submit)
 *   • Depois: 129 linhas (apenas orquestração)
 *   • Redução: 59% ↓
 *   • Complexidade: O(1) por linha
 * 
 * Reutilização:
 *   • FormHeader: Reutilizável em outras páginas ✓
 *   • FormMessages: Reutilizável em outras páginas ✓
 *   • FormActions: Reutilizável em outras páginas ✓
 *   • LoadingSpinner: Reutilizável em toda a app ✓
 *   • Hooks: Reutilizáveis em outros componentes ✓
 * 
 * Testabilidade:
 *   • useDicionarios() → Unit testável ✓
 *   • useProductForm() → Unit testável ✓
 *   • useProductValidation() → Unit testável ✓
 *   • useProductSubmit() → Unit testável ✓
 *   • FormHeader, FormMessages, etc → Component testável ✓
 * 
 * Manutenibilidade:
 *   • Cada hook tem 1 responsabilidade ✓
 *   • Cada component helper tem 1 responsabilidade ✓
 *   • Componente principal é apenas orquestrador ✓
 *   • Fácil adicionar novos campos ✓
 *   • Fácil mudar layout ✓
 * 
 * ============================================================================
 * PARA ADICIONAR NOVO CAMPO
 * ============================================================================
 * 
 * 1. Adicionar a DadosProduto em types/product.types.ts
 * 2. Adicionar o InputSelect/InputText na seção apropriada
 * 3. Adicionar validação em useProductValidation.ts (se obrigatório)
 * 4. Adicionar formData.append() em useProductSubmit.ts
 * 5. Pronto! Tudo funciona automaticamente
 * 
 * ============================================================================
 * ARQUIVOS
 * ============================================================================
 * 
 * CadastroProdutoSKU.tsx          (129 linhas) ← Componente principal
 * ├── hooks/
 * │   ├── useProductForm.ts       (48 linhas)  ← Estado
 * │   ├── useDicionarios.ts       (70 linhas)  ← Carregamento
 * │   ├── useProductValidation.ts (40 linhas)  ← Validação
 * │   └── useProductSubmit.ts     (120 linhas) ← Submit
 * ├── types/
 * │   └── product.types.ts        (150 linhas) ← Tipos
 * ├── FormHeader.tsx              (17 linhas)  ← UI
 * ├── FormMessages.tsx            (24 linhas)  ← UI
 * ├── FormActions.tsx             (33 linhas)  ← UI
 * ├── LoadingSpinner.tsx          (20 linhas)  ← UI
 * ├── FormProductIdentification.tsx
 * ├── FormProductSKU.tsx
 * ├── FormProductDetails.tsx
 * ├── FormProductAttributes.tsx
 * └── FormProductSpecs.tsx
 * 
 * TOTAL: ~800 linhas bem organizadas e reutilizáveis
 * 
 * ============================================================================
 */
